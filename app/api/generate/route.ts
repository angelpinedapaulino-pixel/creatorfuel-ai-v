export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest } from 'next/server'
import { GoogleGenAI } from "@google/genai"
import { getCurrentUser } from '@/lib/auth'
import { fail, unauthorized } from '@/lib/api'
import { getGeneratorTool } from '@/lib/generators'
import { getBusinessBrain } from '@/services/business-brain-service'
import { logActivity } from '@/services/history-service'
import {
  GENERATION_MODEL,
  buildMessages,
  parseGeneration,
  getCredits,
  consumeCredit,
  getUserPlan,
  isPaidPlan,
  resolveLimits,
} from '@/services/generation-service'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const body = await req.json().catch(() => ({}))
  const toolId = (body?.toolId ?? '').toString()
  const inputs: Record<string, string> = (body?.inputs ?? {}) as Record<string, string>

  const tool = getGeneratorTool(toolId)
  if (!tool) return fail('Unknown generator tool.', 404)

  // Required-input validation
  for (const inp of tool.inputs) {
    if (inp.required && !((inputs[inp.key] ?? '').toString().trim())) {
      return fail(`Please provide: ${inp.label}.`)
    }
  }

  // Credit gate — block before any LLM cost is incurred
  const credits = await getCredits(user.id)
  if (!credits || credits.remaining <= 0) {
    return fail('You are out of credits. Upgrade your plan to keep generating.', 402, { needsUpgrade: true })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fail('AI service is not configured. Please contact support.', 500)

  // Resolve effective output limits from the user's plan (FREE = reduced outputs)
  const plan = await getUserPlan(user.id)
  const limits = resolveLimits(tool, isPaidPlan(plan))

  const brain = await getBusinessBrain(user.id)
  const messages = buildMessages(tool, brain, inputs, limits)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      try {
        send({ status: 'processing', message: 'Consulting your Business Brain…' })

const ai = new GoogleGenAI({
  apiKey,
})

const prompt = messages
  .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
  .join("\n\n")

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
})

const buffer = response.text ?? ""

if (!buffer.trim()) {
  send({
    status: "error",
    message: "The AI returned an empty response."
  })
  controller.close()
  return
}

let items

try {
  items = parseGeneration(tool, buffer, limits)
} catch (err: any) {
  console.error(err)

  send({
    status: "error",
    message: err?.message ?? "Unable to parse AI response."
  })

  controller.close()
  return
}
        // Consume exactly one credit for a successful generation
        const updatedCredits = (await consumeCredit(user.id)) ?? (await getCredits(user.id))

        const result = {
          toolId: tool.id,
          toolName: tool.name,
          inputs,
          items,
          createdAt: new Date().toISOString(),
        }

        // Auto-log to history (every generation is recorded)
        const summary = (inputs.topic || inputs.theme || inputs.goal || tool.tagline || '').toString().slice(0, 120)
        await logActivity({
          userId: user.id,
          action: `Generated: ${tool.name}`,
          details: summary ? `“${summary}” — ${items.length} results` : `${items.length} results`,
          metadata: { kind: 'generation', ...result },
        })

        send({ status: 'completed', result, credits: updatedCredits })
        controller.close()
      } catch (err: any) {
        console.error('Generation stream error:', err)
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Something went wrong while generating. Please try again.' })}\n\n`))
        } catch {}
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
