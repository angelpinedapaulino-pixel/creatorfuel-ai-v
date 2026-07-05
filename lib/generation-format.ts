// ============================================================================
// Converts normalized generation items into copy-friendly plain text.
// Used by Copy (single item) and Copy All buttons across the generator UI.
// ============================================================================

import { getGeneratorTool } from '@/lib/generators'
import type { GeneratorTool } from '@/lib/generators'
import type { GeneratedItem } from '@/types'

function ideaToText(item: GeneratedItem, index: number): string {
  const n = index + 1
  const lines = [`${n}. ${item.title ?? ''}`.trim()]
  if (item.whyItWorks) lines.push(`   Why it works: ${item.whyItWorks}`)
  if (item.contentAngle) lines.push(`   Content angle: ${item.contentAngle}`)
  return lines.join('\n')
}

function groupedToText(item: GeneratedItem): string {
  const type = item.type ? `[${item.type}] ` : ''
  return `${type}${item.text ?? ''}`.trim()
}

function platformToText(item: GeneratedItem): string {
  return `${(item.platform ?? '').toUpperCase()}\n${item.text ?? ''}`.trim()
}

function sectionToText(item: GeneratedItem): string {
  return `${(item.label ?? '').toUpperCase()}\n${item.text ?? ''}`.trim()
}

function tableRowToText(item: GeneratedItem, tool: GeneratorTool): string {
  const cols = tool.columns ?? []
  return cols.map((c) => `${c.label}: ${item[c.key] ?? ''}`).join(' | ')
}

/** Format a single generated item to text for the per-item Copy button. */
export function formatItemToText(toolId: string, item: GeneratedItem, index = 0): string {
  const tool = getGeneratorTool(toolId)
  if (!tool) return Object.values(item ?? {}).join(' — ')

  switch (tool.render) {
    case 'ideas':
      return ideaToText(item, index)
    case 'grouped':
      return groupedToText(item)
    case 'list':
      return `${index + 1}. ${item.text ?? ''}`.trim()
    case 'platforms':
      return platformToText(item)
    case 'sections':
      return sectionToText(item)
    case 'table':
      return tableRowToText(item, tool)
    default:
      return Object.values(item ?? {}).join(' — ')
  }
}

/** Format the full result set to text for the Copy All button. */
export function formatAllToText(toolId: string, items: GeneratedItem[]): string {
  const tool = getGeneratorTool(toolId)
  const list = Array.isArray(items) ? items : []
  const header = tool ? `${tool.name}\n${'='.repeat(tool.name.length)}\n` : ''

  if (tool?.render === 'grouped' && tool.groups) {
    const blocks = tool.groups.map((group) => {
      const rows = list.filter((it) => (it.type ?? '').toLowerCase() === group.toLowerCase())
      if (rows.length === 0) return ''
      const body = rows.map((r) => `• ${r.text ?? ''}`).join('\n')
      return `${group}\n${'-'.repeat(group.length)}\n${body}`
    })
    return `${header}\n${blocks.filter(Boolean).join('\n\n')}`.trim()
  }

  const body = list.map((item, i) => formatItemToText(toolId, item, i)).join('\n\n')
  return `${header}\n${body}`.trim()
}
