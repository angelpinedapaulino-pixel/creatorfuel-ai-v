// ============================================================================
// AI Generator tool registry (shared client + server, serializable only)
// ----------------------------------------------------------------------------
// This is the single source of truth for every AI Generator tool. To add a new
// tool in the future, append a GeneratorTool entry here + a prompt spec in
// services/generation-service.ts. UI, routing, validation and result rendering
// are all driven off this config — no page refactors required.
// ============================================================================

import { GENERATOR_PLATFORMS, LANGUAGES, TONES, SCRIPT_DURATIONS, CONTENT_GOALS } from '@/lib/constants'

export type GenInputType = 'text' | 'textarea' | 'select'

export type OptionsSource = 'platforms' | 'languages' | 'tones' | 'durations' | 'goals'

export interface GenInput {
  key: string
  label: string
  type: GenInputType
  placeholder?: string
  required?: boolean
  optionsSource?: OptionsSource
  /** Prefill from the user's Business Brain profile. */
  brainKey?: string
  helper?: string
}

export type RenderKind = 'ideas' | 'grouped' | 'list' | 'platforms' | 'sections' | 'table'

export interface TableColumn {
  key: string
  label: string
}

export interface GeneratorTool {
  id: string
  name: string
  tagline: string
  description: string
  icon: string // lucide icon name (mapped in client)
  accentFrom: string
  accentTo: string
  count: number
  /** Reduced output count for FREE plan users. Falls back to count when unset. */
  freeCount?: number
  inputs: GenInput[]
  render: RenderKind
  /** For 'grouped' render: category order. */
  groups?: string[]
  /** For 'platforms' render: platform names. */
  platformList?: string[]
  /** For 'sections' render: ordered section keys. */
  sections?: string[]
  /** For 'table' render: columns. */
  columns?: TableColumn[]
}

export const HOOK_TYPES = ['Curiosity', 'Story', 'Authority', 'Mistake', 'Fear', 'Contrarian']
export const CTA_TYPES = ['Sales CTA', 'Engagement CTA', 'Lead CTA', 'Soft CTA']
export const DESCRIPTION_PLATFORMS = ['YouTube', 'TikTok', 'Instagram', 'Twitter', 'LinkedIn', 'Facebook',]
export const SCRIPT_SECTIONS = ['Hook', 'Body', 'CTA']

export const GENERATOR_TOOLS: GeneratorTool[] = [
  {
    id: 'viral-ideas',
    name: 'Viral Ideas Generator',
    tagline: '30 scroll-stopping content ideas',
    description: 'Generate 30 viral content ideas complete with a title, why it works, and the exact content angle to use.',
    icon: 'Flame',
    accentFrom: '#7C3AED',
    accentTo: '#A855F7',
    count: 30,
    freeCount: 5,
    render: 'ideas',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. AI productivity tools', required: true },
      { key: 'niche', label: 'Niche', type: 'text', placeholder: 'e.g. SaaS founders', brainKey: 'industry' },
      { key: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is this for?', brainKey: 'targetAudience' },
      { key: 'platform', label: 'Platform', type: 'select', optionsSource: 'platforms' },
      { key: 'language', label: 'Language', type: 'select', optionsSource: 'languages', brainKey: 'language' },
      { key: 'tone', label: 'Tone', type: 'select', optionsSource: 'tones', brainKey: 'brandVoice' },
    ],
  },
  {
    id: 'hooks',
    name: 'Hook Generator',
    tagline: '30 hooks across 6 proven angles',
    description: 'Generate 30 powerful opening hooks spanning Curiosity, Story, Authority, Mistake, Fear and Contrarian styles.',
    icon: 'Anchor',
    accentFrom: '#A855F7',
    accentTo: '#EC4899',
    count: 30,
    freeCount: 5,
    render: 'grouped',
    groups: HOOK_TYPES,
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Growing on Globe in 2025', required: true },
      { key: 'platform', label: 'Platform', type: 'select', optionsSource: 'platforms' },
      { key: 'tone', label: 'Tone', type: 'select', optionsSource: 'tones', brainKey: 'brandVoice' },
    ],
  },
  {
    id: 'titles',
    name: 'Title Generator',
    tagline: '30 click-optimized titles',
    description: 'Generate 30 high-CTR, SEO-aware titles engineered to maximize clicks and watch time.',
    icon: 'Type',
    accentFrom: '#6366F1',
    accentTo: '#7C3AED',
    count: 30,
    freeCount: 5,
    render: 'list',
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Beginner home workouts', required: true },
      { key: 'platform', label: 'Platform', type: 'select', optionsSource: 'platforms' },
      { key: 'tone', label: 'Tone', type: 'select', optionsSource: 'tones', brainKey: 'brandVoice' },
    ],
  },
  {
    id: 'descriptions',
    name: 'Description Generator',
    tagline: 'Optimized copy for 5 platforms',
    description: 'Generate platform-optimized descriptions tailored for Globe, TikTok, Globe, Globe and Globe.',
    icon: 'AlignLeft',
    accentFrom: '#8B5CF6',
    accentTo: '#06B6D4',
    count: 5,
    freeCount: 1,
    render: 'platforms',
    platformList: DESCRIPTION_PLATFORMS,
    inputs: [
      { key: 'topic', label: 'Topic / Content', type: 'text', placeholder: 'What is the content about?', required: true },
      { key: 'tone', label: 'Tone', type: 'select', optionsSource: 'tones', brainKey: 'brandVoice' },
    ],
  },
  {
    id: 'cta',
    name: 'CTA Generator',
    tagline: 'Sales, Engagement, Lead & Soft CTAs',
    description: 'Generate conversion-focused calls to action across Sales, Engagement, Lead and Soft categories.',
    icon: 'MousePointerClick',
    accentFrom: '#7C3AED',
    accentTo: '#F59E0B',
    count: 16,
    freeCount: 5,
    render: 'grouped',
    groups: CTA_TYPES,
    inputs: [
      { key: 'topic', label: 'Topic or Offer', type: 'text', placeholder: 'e.g. Free 7-day trial of our app', required: true },
      { key: 'platform', label: 'Platform', type: 'select', optionsSource: 'platforms' },
      { key: 'tone', label: 'Tone', type: 'select', optionsSource: 'tones', brainKey: 'brandVoice' },
    ],
  },
  {
    id: 'short-script',
    name: 'Short Script Generator',
    tagline: '30–60s scripts: Hook, Body, CTA',
    description: 'Generate a complete short-form video script structured into a scroll-stopping Hook, value-packed Body and a strong CTA.',
    icon: 'Clapperboard',
    accentFrom: '#A855F7',
    accentTo: '#7C3AED',
    count: 1,
    freeCount: 1,
    render: 'sections',
    sections: SCRIPT_SECTIONS,
    inputs: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Why most diets fail', required: true },
      { key: 'platform', label: 'Platform', type: 'select', optionsSource: 'platforms' },
      { key: 'duration', label: 'Duration', type: 'select', optionsSource: 'durations' },
      { key: 'tone', label: 'Tone', type: 'select', optionsSource: 'tones', brainKey: 'brandVoice' },
    ],
  },
  {
    id: 'content-calendar',
    name: '30-Day Content Calendar',
    tagline: 'A full month of posts, planned',
    description: 'Generate a complete 30-day content calendar with platform, topic, goal, hook and CTA mapped to every day.',
    icon: 'CalendarDays',
    accentFrom: '#6366F1',
    accentTo: '#A855F7',
    count: 30,
    freeCount: 7,
    render: 'table',
    columns: [
      { key: 'day', label: 'Day' },
      { key: 'platform', label: 'Platform' },
      { key: 'topic', label: 'Topic' },
      { key: 'goal', label: 'Goal' },
      { key: 'hook', label: 'Hook' },
      { key: 'cta', label: 'CTA' },
    ],
    inputs: [
      { key: 'platform', label: 'Primary Platform', type: 'select', optionsSource: 'platforms' },
      { key: 'goal', label: 'Primary Goal', type: 'select', optionsSource: 'goals' },
      { key: 'theme', label: 'Monthly Theme (optional)', type: 'text', placeholder: 'e.g. Product launch month' },
      { key: 'tone', label: 'Tone', type: 'select', optionsSource: 'tones', brainKey: 'brandVoice' },
    ],
  },
]

export function getGeneratorTool(id: string): GeneratorTool | undefined {
  return GENERATOR_TOOLS.find((t) => t.id === id)
}

export function generatorToolName(id: string): string | undefined {
  return getGeneratorTool(id)?.name
}

export function optionsForSource(source?: OptionsSource): string[] {
  switch (source) {
    case 'platforms':
      return GENERATOR_PLATFORMS
    case 'languages':
      return LANGUAGES
    case 'tones':
      return TONES
    case 'durations':
      return SCRIPT_DURATIONS
    case 'goals':
      return CONTENT_GOALS
    default:
      return []
  }
}
