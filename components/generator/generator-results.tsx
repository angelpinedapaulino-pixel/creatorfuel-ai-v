'use client'

import { getGeneratorTool } from '@/lib/generators'
import { formatItemToText } from '@/lib/generation-format'
import type { GeneratedItem } from '@/types'
import { CopyButton } from '@/components/generator/copy-button'
import { PlatformIcon } from '@/components/generator/icon-map'
import { Badge } from '@/components/ui/badge'

function IdeaCards({ toolId, items }: { toolId: string; items: GeneratedItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="group relative rounded-2xl bg-secondary/40 p-5 ring-1 ring-border/60 transition-colors hover:ring-primary/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg brand-gradient text-xs font-bold text-white">{i + 1}</span>
              <h4 className="font-display text-sm font-semibold leading-snug">{it.title}</h4>
            </div>
            <CopyButton text={formatItemToText(toolId, it, i)} size="icon" className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {it.whyItWorks && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-primary">Why it works: </span>{it.whyItWorks}
            </p>
          )}
          {it.contentAngle && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-primary">Content angle: </span>{it.contentAngle}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function GroupedList({ toolId, items, groups }: { toolId: string; items: GeneratedItem[]; groups: string[] }) {
  const order = groups.length ? groups : Array.from(new Set(items.map((i) => i.type)))
  return (
    <div className="space-y-6">
      {order.map((group) => {
        const rows = items.filter((it) => (it.type ?? '').toLowerCase() === group.toLowerCase())
        if (!rows.length) return null
        return (
          <div key={group}>
            <div className="mb-3 flex items-center gap-2">
              <Badge className="brand-gradient border-0 text-white">{group}</Badge>
              <span className="text-xs text-muted-foreground">{rows.length} results</span>
            </div>
            <ul className="space-y-2">
              {rows.map((it, i) => (
                <li key={i} className="group flex items-start justify-between gap-3 rounded-xl bg-secondary/40 px-4 py-3 ring-1 ring-border/50">
                  <p className="text-sm leading-relaxed">{it.text}</p>
                  <CopyButton text={it.text} size="icon" className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function SimpleList({ toolId, items }: { toolId: string; items: GeneratedItem[] }) {
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {items.map((it, i) => (
        <li key={i} className="group flex items-start justify-between gap-3 rounded-xl bg-secondary/40 px-4 py-3 ring-1 ring-border/50">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xs font-bold text-primary">{i + 1}.</span>
            <p className="text-sm leading-relaxed">{it.text}</p>
          </div>
          <CopyButton text={it.text} size="icon" className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </li>
      ))}
    </ul>
  )
}

function PlatformCards({ toolId, items }: { toolId: string; items: GeneratedItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="group rounded-2xl bg-secondary/40 p-5 ring-1 ring-border/60">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary"><PlatformIcon name={it.platform} className="h-4 w-4" /></span>
              <span className="font-display text-sm font-semibold">{it.platform}</span>
            </div>
            <CopyButton text={it.text} size="icon" className="opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{it.text}</p>
        </div>
      ))}
    </div>
  )
}

function Sections({ toolId, items }: { toolId: string; items: GeneratedItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="group rounded-2xl bg-secondary/40 p-5 ring-1 ring-border/60">
          <div className="mb-2 flex items-center justify-between">
            <Badge className="brand-gradient border-0 text-white">{it.label}</Badge>
            <CopyButton text={it.text} size="icon" className="opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{it.text}</p>
        </div>
      ))}
    </div>
  )
}

function CalendarTable({ toolId, items, columns }: { toolId: string; items: GeneratedItem[]; columns: { key: string; label: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-border/60">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-secondary/60">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</th>
            ))}
            <th className="w-12 px-2 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={i} className="group border-t border-border/50 align-top transition-colors hover:bg-secondary/30">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 ${c.key === 'day' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                  {c.key === 'day' ? `Day ${row[c.key]}` : row[c.key]}
                </td>
              ))}
              <td className="px-2 py-3">
                <CopyButton text={formatItemToText(toolId, row, i)} size="icon" className="opacity-0 transition-opacity group-hover:opacity-100" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function GeneratorResults({ toolId, items }: { toolId: string; items: GeneratedItem[] }) {
  const tool = getGeneratorTool(toolId)
  if (!tool || !items?.length) return null

  switch (tool.render) {
    case 'ideas':
      return <IdeaCards toolId={toolId} items={items} />
    case 'grouped':
      return <GroupedList toolId={toolId} items={items} groups={tool.groups ?? []} />
    case 'list':
      return <SimpleList toolId={toolId} items={items} />
    case 'platforms':
      return <PlatformCards toolId={toolId} items={items} />
    case 'sections':
      return <Sections toolId={toolId} items={items} />
    case 'table':
      return <CalendarTable toolId={toolId} items={items} columns={tool.columns ?? []} />
    default:
      return null
  }
}
