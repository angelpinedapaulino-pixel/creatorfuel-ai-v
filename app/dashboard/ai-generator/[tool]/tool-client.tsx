'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft, Loader2, RefreshCw, Save, Sparkles, Wand2, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useApi } from '@/hooks/use-api'
import { useCredits } from '@/hooks/use-credits'
import { apiFetch } from '@/lib/api-client'
import { runGenerationStream } from '@/lib/generate-client'
import { getGeneratorTool, optionsForSource } from '@/lib/generators'
import { formatAllToText } from '@/lib/generation-format'
import { ToolIcon } from '@/components/generator/icon-map'
import { CreditPill } from '@/components/generator/credit-pill'
import { UpgradeModal } from '@/components/generator/upgrade-modal'
import { CopyButton } from '@/components/generator/copy-button'
import { GeneratorResults } from '@/components/generator/generator-results'
import type { BusinessBrainData, GenerationResult } from '@/types'

function buildInitialForm(toolId: string, brain: BusinessBrainData | null): Record<string, string> {
  const tool = getGeneratorTool(toolId)
  const form: Record<string, string> = {}
  if (!tool) return form
  for (const inp of tool.inputs) {
    if (inp.type === 'select') {
      const opts = optionsForSource(inp.optionsSource)
      let def = opts[0] ?? ''
      if (inp.brainKey && brain) {
        const bv = (brain as any)[inp.brainKey]
        if (typeof bv === 'string' && opts.includes(bv)) def = bv
      }
      if (inp.key === 'platform' && brain?.preferredPlatforms?.length) {
        const p = brain.preferredPlatforms[0]
        if (opts.includes(p)) def = p
      }
      form[inp.key] = def
    } else {
      let def = ''
      if (inp.brainKey && brain) {
        const bv = (brain as any)[inp.brainKey]
        if (typeof bv === 'string') def = bv
      }
      form[inp.key] = def
    }
  }
  return form
}

export function ToolClient({ toolId, projectId }: { toolId: string; projectId: string | null }) {
  const tool = getGeneratorTool(toolId)!
  const { data: brainData, loading: brainLoading } = useApi<{ brain: BusinessBrainData | null }>('/api/business-brain')
  const brain = brainData?.brain ?? null
  const { credits, setCredits, refetch: refetchCredits, isPaid } = useCredits()
  const effectiveCount = isPaid ? tool.count : (tool.freeCount ?? tool.count)

  const [form, setForm] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle')
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const [saveOpen, setSaveOpen] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const initedFromBrain = useRef(false)
  const loadedProject = useRef(false)

  // Prefill the form from the Business Brain once it loads (unless a saved project is being opened)
  useEffect(() => {
    if (projectId || initedFromBrain.current || brainLoading) return
    setForm(buildInitialForm(toolId, brain))
    initedFromBrain.current = true
  }, [brain, brainLoading, toolId, projectId])

  // Open a previously saved generation (from Projects "Open")
  useEffect(() => {
    if (!projectId || loadedProject.current) return
    loadedProject.current = true
    ;(async () => {
      try {
        const data = await apiFetch<{ project: { title: string; content: string } }>(`/api/projects/${projectId}`)
        const parsed = JSON.parse(data?.project?.content || '{}') as GenerationResult
        const base = buildInitialForm(toolId, brain)
        setForm({ ...base, ...(parsed?.inputs ?? {}) })
        if (Array.isArray(parsed?.items) && parsed.items.length) {
          setResult(parsed)
          setStatus('done')
        }
        initedFromBrain.current = true
      } catch {
        toast.error('Could not open that saved generation.')
      }
    })()
  }, [projectId, toolId, brain])

  const setField = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const outOfCredits = (credits?.remaining ?? 0) <= 0

  const generate = useCallback(async () => {
    if (outOfCredits) {
      setUpgradeOpen(true)
      return
    }
    for (const inp of tool.inputs) {
      if (inp.required && !(form[inp.key] ?? '').toString().trim()) {
        toast.error(`Please provide: ${inp.label}`)
        return
      }
    }
    setStatus('generating')
    setError(null)
    setProgress('Starting your generation…')
    await runGenerationStream(tool.id, form, {
      onProgress: (m) => setProgress(m),
      onComplete: (res, newCredits) => {
        setResult(res)
        if (newCredits) setCredits(newCredits)
        setStatus('done')
        toast.success('Generation complete!')
      },
      onError: (msg, needsUpgrade) => {
        setStatus(result ? 'done' : 'idle')
        if (needsUpgrade) {
          setUpgradeOpen(true)
          refetchCredits()
        } else {
          setError(msg)
          toast.error(msg)
        }
      },
    })
  }, [form, outOfCredits, tool, result, setCredits, refetchCredits])

  const openSave = () => {
    const topic = form.topic || form.theme || tool.name
    setSaveTitle(`${tool.name}: ${topic}`.slice(0, 80))
    setSaveOpen(true)
  }

  const saveProject = async () => {
    if (!result) return
    const title = saveTitle.trim()
    if (!title) {
      toast.error('Please enter a title.')
      return
    }
    setSaving(true)
    try {
      await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          title,
          type: tool.id,
          description: tool.tagline,
          status: 'COMPLETED',
          content: JSON.stringify(result),
        }),
      })
      toast.success('Saved to your Projects!')
      setSaveOpen(false)
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not save project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-md"
            style={{ backgroundImage: `linear-gradient(135deg, ${tool.accentFrom}, ${tool.accentTo})` }}
          >
            <ToolIcon name={tool.icon} className="h-6 w-6" />
          </span>
          <div>
            <Link href="/dashboard/ai-generator" className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> All tools
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight">{tool.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <CreditPill />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Input form */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border/60">
            <div className="mb-4 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold">Generation settings</h2>
            </div>

            {brainLoading && !initedFromBrain.current ? (
              <div className="space-y-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              <div className="space-y-4">
                {tool.inputs.map((inp) => (
                  <div key={inp.key} className="flex flex-col gap-1.5">
                    <Label htmlFor={inp.key}>
                      {inp.label} {inp.required && <span className="text-primary">*</span>}
                    </Label>
                    {inp.type === 'select' ? (
                      <Select value={form[inp.key] ?? ''} onValueChange={(v: string) => setField(inp.key, v)}>
                        <SelectTrigger id={inp.key}><SelectValue placeholder={`Select ${inp.label.toLowerCase()}`} /></SelectTrigger>
                        <SelectContent>
                          {optionsForSource(inp.optionsSource).map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : inp.type === 'textarea' ? (
                      <Textarea id={inp.key} rows={3} placeholder={inp.placeholder} value={form[inp.key] ?? ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
  setField(inp.key, e.target.value)
} />
                    ) : (
                      <Input id={inp.key} placeholder={inp.placeholder} value={form[inp.key] ?? ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setField(inp.key, e.target.value)
} />
                    )}
                    {inp.helper && <p className="text-xs text-muted-foreground">{inp.helper}</p>}
                  </div>
                ))}

                {outOfCredits ? (
                  <Button className="w-full" onClick={() => setUpgradeOpen(true)}>
                    <Sparkles className="h-4 w-4" /> Out of credits — Upgrade
                  </Button>
                ) : (
                  <Button className="w-full" onClick={generate} loading={status === 'generating'} disabled={status === 'generating'}>
                    <Sparkles className="h-4 w-4" /> {result ? 'Generate again' : 'Generate'}
                  </Button>
                )}
                <p className="text-center text-xs text-muted-foreground">Uses 1 credit · {credits?.remaining ?? 0} remaining</p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="min-w-0">
          {status === 'generating' && !result ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card p-12 text-center shadow-sm ring-1 ring-border/60">
              <div className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-2xl brand-gradient text-white"><Loader2 className="h-8 w-8 animate-spin" /></span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Generating your content…</h3>
                <p className="mt-1 text-sm text-muted-foreground">{progress || 'Working on it…'}</p>
              </div>
              <div className="grid w-full max-w-md gap-2 pt-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            </div>
          ) : result && status !== 'generating' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/60">
                <div>
                  <h3 className="font-display text-sm font-semibold">{result.items.length} results generated</h3>
                  <p className="text-xs text-muted-foreground">Review, copy, or save your generation.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CopyButton
                    text={formatAllToText(tool.id, result.items)}
                    label="Copy All"
                    copiedLabel="Copied all"
                    variant="outline"
                    size="sm"
                    showToast
                  />
                  <Button variant="outline" size="sm" onClick={generate}>
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </Button>
                  <Button size="sm" onClick={openSave}>
                    <Save className="h-4 w-4" /> Save Project
                  </Button>
                </div>
              </div>

              <GeneratorResults toolId={tool.id} items={result.items} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-12 text-center shadow-sm ring-1 ring-border/60">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive"><AlertCircle className="h-7 w-7" /></span>
              <h3 className="font-display text-lg font-semibold">Generation failed</h3>
              <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
              <Button onClick={generate}><RefreshCw className="h-4 w-4" /> Try again</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/70 bg-card/50 p-12 text-center">
              <span
                className="grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md"
                style={{ backgroundImage: `linear-gradient(135deg, ${tool.accentFrom}, ${tool.accentTo})` }}
              >
                <ToolIcon name={tool.icon} className="h-8 w-8" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold">Ready when you are</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Fill in the settings and hit Generate. We&apos;ll use your Business Brain to craft {effectiveCount > 1 ? `${effectiveCount} on-brand results` : 'an on-brand result'}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as project</DialogTitle>
            <DialogDescription>Save this generation to your Projects so you can open, edit or reuse it later.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="save-title">Project title</Label>
            <Input
  id="save-title"
  value={saveTitle}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    setSaveTitle(e.target.value)
  }
  maxLength={120}
/>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={saveProject} loading={saving}>Save Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  )
}
