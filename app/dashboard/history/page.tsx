'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Activity, CheckCircle2, Clock, Search, Trash2, ExternalLink, Sparkles, MoreVertical, Copy, Eye,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useApi } from '@/hooks/use-api'
import { apiFetch } from '@/lib/api-client'
import { formatAllToText } from '@/lib/generation-format'
import { GeneratorResults } from '@/components/generator/generator-results'
import { CopyButton } from '@/components/generator/copy-button'
import { copyText } from '@/lib/clipboard'
import { getGeneratorTool } from '@/lib/generators'
import { ToolIcon } from '@/components/generator/icon-map'
import type { HistoryItem, GeneratedItem } from '@/types'

interface GenMeta {
  kind: string
  toolId: string
  toolName: string
  inputs?: Record<string, string>
  items: GeneratedItem[]
  createdAt?: string
}

function genMeta(h: HistoryItem): GenMeta | null {
  const m = h.metadata as any
  if (m && m.kind === 'generation' && Array.isArray(m.items) && m.items.length > 0) return m as GenMeta
  return null
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
  } catch { return '' }
}

export default function HistoryPage() {
  const { data, loading, refetch } = useApi<{ history: HistoryItem[] }>('/api/history')
  const history = data?.history ?? []

  const [query, setQuery] = useState('')
  const [openGen, setOpenGen] = useState<{ meta: GenMeta; item: HistoryItem } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HistoryItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return history
    return history.filter((h) => `${h.action} ${h.details}`.toLowerCase().includes(q))
  }, [history, query])

  const copyGen = async (m: GenMeta) => {
    const okc = await copyText(formatAllToText(m.toolId, m.items))
    if (okc) toast.success('Copied all results to clipboard')
    else toast.error('Could not copy. Please try again.')
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiFetch(`/api/history/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Activity entry removed.')
      setDeleteTarget(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not remove this entry.')
    } finally {
      setDeleting(false)
    }
  }

  const openTool = openGen ? getGeneratorTool(openGen.meta.toolId) : undefined

  return (
    <div className="mx-auto w-full max-w-[900px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Activity History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every generation and action is recorded here. Search, re-open and copy anytime.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setQuery(e.target.value)
} placeholder="Search activity"
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-12 text-center shadow-sm">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground"><Activity className="h-7 w-7" /></span>
          <h3 className="font-display text-lg font-semibold">No activity yet</h3>
          <p className="text-sm text-muted-foreground">Your actions will be recorded here as you use the platform.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-12 text-center shadow-sm">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground"><Search className="h-7 w-7" /></span>
          <h3 className="font-display text-lg font-semibold">No matching activity</h3>
          <p className="text-sm text-muted-foreground">Try a different search term.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <ol className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {filtered.map((h) => {
              const meta = genMeta(h)
              const tool = meta ? getGeneratorTool(meta.toolId) : undefined
              return (
                <li key={h.id} className="group relative flex gap-4 pl-0">
                  <span className="z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-4 ring-card">
                    {meta && tool ? <ToolIcon name={tool.icon} className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className="truncate">{h.action}</span>
                          {meta && <Badge variant="secondary" className="shrink-0"><Sparkles className="mr-1 h-3 w-3" /> {meta.items.length}</Badge>}
                        </div>
                        {h.details && <div className="text-sm text-muted-foreground">{h.details}</div>}
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {formatDateTime(h.createdAt)}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {meta && (
                          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setOpenGen({ meta, item: h })}>
                            <Eye className="h-4 w-4" /> Open
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Activity actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {meta && (
                              <>
                                <DropdownMenuItem onClick={() => setOpenGen({ meta, item: h })}>
                                  <Eye className="mr-2 h-4 w-4" /> Open results
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyGen(meta)}>
                                  <Copy className="mr-2 h-4 w-4" /> Copy all
                                </DropdownMenuItem>
                                {tool && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/ai-generator/${tool.id}`}><ExternalLink className="mr-2 h-4 w-4" /> Open tool</Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(h)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Open generation results dialog */}
      <Dialog open={!!openGen} onOpenChange={(o: boolean) => {
  if (!o) setOpenGen(null)
}}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {openTool && (
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg text-white"
                  style={{ backgroundImage: `linear-gradient(135deg, ${openTool.accentFrom}, ${openTool.accentTo})` }}
                >
                  <ToolIcon name={openTool.icon} className="h-4 w-4" />
                </span>
              )}
              {openGen?.meta.toolName ?? 'Generation'}
            </DialogTitle>
            <DialogDescription>
              {openGen ? `${openGen.meta.items.length} results · ${formatDateTime(openGen.item.createdAt)}` : ''}
            </DialogDescription>
          </DialogHeader>
          {openGen && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <CopyButton
                  text={formatAllToText(openGen.meta.toolId, openGen.meta.items)}
                  label="Copy all"
                  variant="outline"
                  size="sm"
                  showToast
                />
                {openTool && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/ai-generator/${openTool.id}`}><ExternalLink className="h-4 w-4" /> Open tool</Link>
                  </Button>
                )}
              </div>
              <GeneratorResults toolId={openGen.meta.toolId} items={openGen.meta.items} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o: boolean) => {
  if (!o) setDeleteTarget(null)
}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this activity entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the entry from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault()
  doDelete()
}}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
