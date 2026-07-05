'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Plus, FolderKanban, FileText, MoreVertical, Pencil, Copy, Trash2, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApi } from '@/hooks/use-api'
import { apiFetch } from '@/lib/api-client'
import { PROJECT_TYPES, projectTypeLabel } from '@/lib/constants'
import { getGeneratorTool, generatorToolName } from '@/lib/generators'
import { ToolIcon } from '@/components/generator/icon-map'
import type { ProjectItem } from '@/types'

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) } catch { return '' }
}

export default function ProjectsPage() {
  const { data, loading, refetch } = useApi<{ projects: ProjectItem[] }>('/api/projects')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', type: 'blog_post' })

  // Rename dialog state
  const [renameTarget, setRenameTarget] = useState<ProjectItem | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [renaming, setRenaming] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Track per-project busy state (duplicate)
  const [busyId, setBusyId] = useState<string | null>(null)

  const projects = data?.projects ?? []

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiFetch('/api/projects', { method: 'POST', body: JSON.stringify(form) })
      toast.success('Project created!')
      setOpen(false)
      setForm({ title: '', description: '', type: 'blog_post' })
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not create project.')
    } finally {
      setSaving(false)
    }
  }

  const openRename = (p: ProjectItem) => {
    setRenameTarget(p)
    setRenameTitle(p.title)
  }

  const doRename = async () => {
    if (!renameTarget) return
    const title = renameTitle.trim()
    if (!title) { toast.error('Please enter a title.'); return }
    setRenaming(true)
    try {
      await apiFetch(`/api/projects/${renameTarget.id}`, { method: 'PUT', body: JSON.stringify({ title }) })
      toast.success('Project renamed.')
      setRenameTarget(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not rename project.')
    } finally {
      setRenaming(false)
    }
  }

  const doDuplicate = async (p: ProjectItem) => {
    setBusyId(p.id)
    try {
      await apiFetch('/api/projects', { method: 'POST', body: JSON.stringify({ duplicateFrom: p.id }) })
      toast.success('Project duplicated.')
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not duplicate project.')
    } finally {
      setBusyId(null)
    }
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiFetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('Project deleted.')
      setDeleteTarget(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not delete project.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, open and manage all of your saved content.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New Project</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new project</DialogTitle>
              <DialogDescription>Give your content project a title, type and short description.</DialogDescription>
            </DialogHeader>
            <form onSubmit={create} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((f) => ({ ...f, title: e.target.value }))
} placeholder="e.g. Summer launch blog post" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Content type</Label>
                <Select value={form.type} onValueChange={(v: string) =>
  setForm((f) => ({ ...f, type: v }))
}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={3} value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
  setForm((f) => ({ ...f, description: e.target.value }))
} placeholder="What is this project about?" />
              </div>
              <DialogFooter>
                <Button type="submit" loading={saving}>Create project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-12 text-center shadow-sm">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground"><FolderKanban className="h-7 w-7" /></span>
          <div>
            <h3 className="font-display text-lg font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first content project or save a result from the AI Generator.</p>
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Project</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const tool = getGeneratorTool(p.type)
            const typeName = generatorToolName(p.type) ?? projectTypeLabel(p.type)
            const openHref = tool ? `/dashboard/ai-generator/${tool.id}?project=${p.id}` : null
            return (
              <div key={p.id} className="flex flex-col rounded-2xl bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-white"
                    style={tool
                      ? { backgroundImage: `linear-gradient(135deg, ${tool.accentFrom}, ${tool.accentTo})` }
                      : undefined}
                  >
                    {tool ? <ToolIcon name={tool.icon} className="h-5 w-5" /> : <FileText className="h-5 w-5 text-primary" />}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary">{p.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Project actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {openHref && (
                          <DropdownMenuItem asChild>
                            <Link href={openHref}><ExternalLink className="mr-2 h-4 w-4" /> Open</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openRename(p)}>
                          <Pencil className="mr-2 h-4 w-4" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => doDuplicate(p)} disabled={busyId === p.id}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(p)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {openHref ? (
                  <Link href={openHref} className="font-display text-base font-semibold hover:text-primary">{p.title}</Link>
                ) : (
                  <h3 className="font-display text-base font-semibold">{p.title}</h3>
                )}
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.description || 'No description provided.'}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-primary">{typeName}</span>
                  <span>{formatDate(p.createdAt)}</span>
                </div>
                {openHref && (
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={openHref}><ExternalLink className="h-4 w-4" /> Open in generator</Link>
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Rename dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(o: boolean) => {
  if (!o) setRenameTarget(null)
}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Choose a new title for this project.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 pt-2">
            <Label htmlFor="rename">Title</Label>
            <Input
              id="rename"
              value={renameTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setRenameTitle(e.target.value)
}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') doRename()
}}
              placeholder="Project title"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={doRename} loading={renaming}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o: boolean) => {
  if (!o) setDeleteTarget(null)
}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed. This action cannot be undone.
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
