// ============================================================================
// Server-side AI generation engine.
// - Injects the user's Business Brain into every prompt automatically.
// - Builds a strict JSON contract per tool.
// - Normalizes model output into the shared GeneratedItem[] shape.
// - Handles atomic credit checks/consumption and history logging.
// ============================================================================

import { prisma } from '@/lib/db'
import { getGeneratorTool, HOOK_TYPES, CTA_TYPES, DESCRIPTION_PLATFORMS, SCRIPT_SECTIONS } from '@/lib/generators'
import type { GeneratorTool } from '@/lib/generators'
import type { BusinessBrainData, GeneratedItem, CreditsInfo } from '@/types'

export const GENERATION_MODEL = 'gpt-5.4-mini'

// ---------- Business Brain context ----------

export function brainContext(brain: BusinessBrainData | null): string {
  if (!brain || !brain.businessName) {
    return 'No Business Brain profile is set yet. Use the provided inputs and sensible best-practice assumptions.'
  }
  const parts: string[] = [
    `Business name: ${brain.businessName}`,
    brain.businessDescription && `What they do: ${brain.businessDescription}`,
    brain.industry && `Industry: ${brain.industry}`,
    brain.products && `Products: ${brain.products}`,
    brain.services && `Services: ${brain.services}`,
    brain.targetAudience && `Target audience: ${brain.targetAudience}`,
    brain.country && `Country/market: ${brain.country}`,
    brain.language && `Primary language: ${brain.language}`,
    brain.brandVoice && `Brand voice: ${brain.brandVoice}`,
    brain.contentGoals?.length && `Content goals: ${brain.contentGoals.join(', ')}`,
    brain.preferredPlatforms?.length && `Preferred platforms: ${brain.preferredPlatforms.join(', ')}`,
  ].filter(Boolean) as string[]
  return parts.join('\n')
}

// ---------- Plan-aware generation limits ----------

/** Effective per-generation limits, resolved from the tool config + the user's plan. */
export interface GenLimits {
  /** Effective item count for count-based renders (ideas/grouped/list/table). */
  count: number
  /** Effective platform list for the 'platforms' render. */
  platforms: string[]
  /** Section list for the 'sections' render (unchanged across plans). */
  sections: string[]
  /** Whether the user is on a paid plan (full outputs) or FREE (reduced). */
  isPaid: boolean
}

/** FREE plan → reduced outputs (tool.freeCount); any paid plan → full outputs (tool.count). */
export function resolveLimits(tool: GeneratorTool, isPaid: boolean): GenLimits {
  const count = isPaid ? tool.count : (tool.freeCount ?? tool.count)
  const fullPlatforms = tool.platformList ?? DESCRIPTION_PLATFORMS
  const platformCap = Math.max(1, tool.freeCount ?? fullPlatforms.length)
  const platforms = isPaid ? fullPlatforms : fullPlatforms.slice(0, platformCap)
  const sections = tool.sections ?? SCRIPT_SECTIONS
  return { count, platforms, sections, isPaid }
}

/** Max number of items to keep after normalization, per render kind. */
function itemCap(tool: GeneratorTool, limits: GenLimits): number {
  if (tool.render === 'platforms') return limits.platforms.length
  if (tool.render === 'sections') return limits.sections.length
  return limits.count
}

// ---------- Per-tool JSON contract ----------

interface SchemaSpec {
  instruction: string
  example: string
}

function schemaSpec(tool: GeneratorTool, limits: GenLimits): SchemaSpec {
  switch (tool.render) {
    case 'ideas':
      return {
        instruction:
          `Return exactly ${limits.count} viral content ideas. Each item MUST have: "title" (a punchy, scroll-stopping idea title), "whyItWorks" (1-2 sentences on the psychology/reason it performs), and "contentAngle" (the specific angle or format to execute it).`,
        example:
          '{"items":[{"title":"...","whyItWorks":"...","contentAngle":"..."}]}',
      }
    case 'grouped': {
      const groups = tool.groups ?? []
      const per = Math.max(1, Math.round(limits.count / Math.max(1, groups.length)))
      const coverage =
        limits.count >= groups.length
          ? 'Cover every category.'
          : `Spread them across ${limits.count} different categories (roughly one per category).`
      return {
        instruction:
          `Return exactly ${limits.count} items, evenly distributed with about ${per} per category. Each item MUST have: "type" (one of exactly: ${groups.join(', ')}) and "text" (the ${tool.id === 'cta' ? 'call-to-action' : 'hook'} itself). ${coverage}`,
        example: '{"items":[{"type":"' + (groups[0] ?? '') + '","text":"..."}]}',
      }
    }
    case 'list':
      return {
        instruction:
          `Return exactly ${limits.count} optimized, high-CTR titles. Each item MUST have a single field "text" containing one title. Vary lengths, formats and emotional triggers.`,
        example: '{"items":[{"text":"..."}]}',
      }
    case 'platforms': {
      const plats = limits.platforms
      return {
        instruction:
          `Return exactly ${plats.length} item${plats.length === 1 ? '' : 's'}, one per platform. Each item MUST have: "platform" (one of exactly: ${plats.join(', ')}) and "text" (a description optimized for that platform's format, length and best practices, including relevant hashtags where appropriate).`,
        example: '{"items":[{"platform":"' + plats[0] + '","text":"..."}]}',
      }
    }
    case 'sections': {
      const secs = limits.sections
      return {
        instruction:
          `Return exactly ${secs.length} items, one per section in this order: ${secs.join(', ')}. Each item MUST have: "label" (one of exactly: ${secs.join(', ')}) and "text" (the spoken script for that section). The full script should fit the requested duration when read aloud.`,
        example: '{"items":[{"label":"Hook","text":"..."},{"label":"Body","text":"..."},{"label":"CTA","text":"..."}]}',
      }
    }
    case 'table':
      return {
        instruction:
          `Return exactly ${limits.count} items — a full ${limits.count}-day content calendar. Each item MUST have: "day" (a number 1-${limits.count} as a string), "platform", "topic", "goal", "hook" (a scroll-stopping opener) and "cta". Make each day distinct and progressively build momentum across the ${limits.count} days.`,
        example:
          '{"items":[{"day":"1","platform":"...","topic":"...","goal":"...","hook":"...","cta":"..."}]}',
      }
    default:
      return { instruction: 'Return an "items" array.', example: '{"items":[]}' }
  }
}

// ---------- Prompt builder ----------

export function buildMessages(
  tool: GeneratorTool,
  brain: BusinessBrainData | null,
  inputs: Record<string, string>,
  limits: GenLimits
): { role: string; content: string }[] {
  const spec = schemaSpec(tool, limits)
  const language = inputs.language || brain?.language || 'English'

  const inputLines = tool.inputs
    .map((inp) => {
      const v = (inputs[inp.key] ?? '').toString().trim()
      return v ? `- ${inp.label}: ${v}` : null
    })
    .filter(Boolean)
    .join('\n')

  const system = [
    'You are CreatorFuel AI, a world-class viral content strategist and copywriter.',
    'You create high-performing, platform-native content for creators and businesses.',
    'You always ground your output in the provided Business Brain so it feels on-brand.',
    `Write all output in ${language}.`,
    'Respond with raw JSON only. Do not include code blocks, markdown, commentary or any text outside the JSON object.',
  ].join(' ')

  const user = [
    `TASK: ${tool.name} — ${tool.description}`,
    '',
    'BUSINESS BRAIN (use this context in every result):',
    brainContext(brain),
    '',
    inputLines ? `REQUEST DETAILS:\n${inputLines}` : 'REQUEST DETAILS: (none provided — infer from the Business Brain)',
    '',
    'OUTPUT CONTRACT:',
    spec.instruction,
    '',
    `Respond with a single JSON object of this exact shape (values are placeholders): ${spec.example}`,
    'Respond with raw JSON only. No markdown, no code fences.',
  ].join('\n')

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

// ---------- Output parsing + normalization ----------

function str(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  return String(v).trim()
}

export function extractItemsArray(parsed: any): any[] {
  if (!parsed) return []
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed.items)) return parsed.items
  // Fallback: first array-valued property
  for (const key of Object.keys(parsed)) {
    if (Array.isArray(parsed[key])) return parsed[key]
  }
  // script sometimes returns an object of sections
  if (parsed.script && typeof parsed.script === 'object') {
    return SCRIPT_SECTIONS.map((label) => ({ label, text: parsed.script[label.toLowerCase()] }))
  }
  return []
}

function matchGroup(value: string, groups: string[]): string {
  const v = (value ?? '').toLowerCase()
  return groups.find((g) => g.toLowerCase() === v) || groups.find((g) => v.includes(g.toLowerCase().split(' ')[0])) || value || groups[0]
}

export function normalizeItems(tool: GeneratorTool, rawItems: any[], limits: GenLimits): GeneratedItem[] {
  const items = Array.isArray(rawItems) ? rawItems : []
  const cap = itemCap(tool, limits)

  let mapped: GeneratedItem[]
  switch (tool.render) {
    case 'ideas':
      mapped = items
        .map((it) => ({
          title: str(it.title || it.idea || it.name),
          whyItWorks: str(it.whyItWorks || it.why || it.reason),
          contentAngle: str(it.contentAngle || it.angle || it.format),
        }))
        .filter((it) => it.title)
      break
    case 'grouped':
      mapped = items
        .map((it) => ({
          type: matchGroup(str(it.type || it.category), tool.groups ?? []),
          text: str(it.text || it.hook || it.cta || it.content),
        }))
        .filter((it) => it.text)
      break
    case 'list':
      mapped = items
        .map((it) => ({ text: typeof it === 'string' ? str(it) : str(it.text || it.title) }))
        .filter((it) => it.text)
      break
    case 'platforms': {
      const allowed = limits.platforms.map((p) => p.toLowerCase())
      mapped = items
        .map((it) => ({
          platform: str(it.platform || it.name),
          text: str(it.text || it.description || it.content),
        }))
        .filter((it) => it.text)
        .filter((it) => allowed.length === 0 || allowed.includes(it.platform.toLowerCase()))
      break
    }
    case 'sections':
      mapped = items
        .map((it) => ({ label: str(it.label || it.section), text: str(it.text || it.content || it.script) }))
        .filter((it) => it.text)
      break
    case 'table':
      mapped = items
        .map((it, i) => ({
          day: str(it.day || i + 1),
          platform: str(it.platform),
          topic: str(it.topic || it.title),
          goal: str(it.goal || it.objective),
          hook: str(it.hook),
          cta: str(it.cta || it.callToAction),
        }))
        .filter((it) => it.topic || it.hook)
      break
    default:
      mapped = items.map((it) => (typeof it === 'string' ? { text: str(it) } : it))
  }

  // Enforce the effective plan limit even if the model over-produces.
  return cap > 0 ? mapped.slice(0, cap) : mapped
}

export function parseGeneration(tool: GeneratorTool, content: string, limits: GenLimits): GeneratedItem[] {
  let cleaned = (content ?? '').trim()
  // Strip accidental code fences
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  // Attempt to isolate the JSON object if the model added stray text
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first > 0 || last < cleaned.length - 1) {
    if (first !== -1 && last !== -1 && last > first) {
      cleaned = cleaned.slice(first, last + 1)
    }
  }
  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('The AI returned an unexpected format. Please try again.')
  }
  const items = normalizeItems(tool, extractItemsArray(parsed), limits)
  if (!items.length) {
    throw new Error('The AI did not return any usable results. Please try again.')
  }
  return items
}

// ---------- Plan lookup ----------

/** Returns the user's current plan name, defaulting to FREE when no subscription exists. */
export async function getUserPlan(userId: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { userId } })
  return sub?.plan ?? 'FREE'
}

/** Any plan other than FREE unlocks full outputs. */
export function isPaidPlan(plan: string): boolean {
  return plan !== 'FREE'
}

// ---------- Credits ----------

export function serializeCredits(c: any): CreditsInfo {
  return {
    total: c?.total ?? 0,
    used: c?.used ?? 0,
    remaining: c?.remaining ?? 0,
    resetDate: (c?.resetDate ?? new Date()).toISOString?.() ?? new Date().toISOString(),
  }
}

export async function getCredits(userId: string): Promise<CreditsInfo | null> {
  let c = await prisma.credits.findUnique({ where: { userId } })
  if (!c) {
    // Auto-provision a default credit balance so users are never permanently locked out.
    const resetDate = new Date()
    resetDate.setDate(resetDate.getDate() + 30)
    try {
      c = await prisma.credits.create({
        data: { userId, total: 5, used: 0, remaining: 5, resetDate },
      })
    } catch {
      // If a concurrent request created it first, re-read.
      c = await prisma.credits.findUnique({ where: { userId } })
    }
  }
  return c ? serializeCredits(c) : null
}

/** Atomically consume exactly one credit. Returns the updated credits or null if none remain. */
export async function consumeCredit(userId: string): Promise<CreditsInfo | null> {
  const res = await prisma.credits.updateMany({
    where: { userId, remaining: { gt: 0 } },
    data: { used: { increment: 1 }, remaining: { decrement: 1 } },
  })
  if (res.count === 0) return null
  return getCredits(userId)
}
