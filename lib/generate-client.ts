'use client'

import type { GenerationResult, CreditsInfo } from '@/types'

export interface GenerateCallbacks {
  onProgress?: (message: string) => void
  onComplete: (result: GenerationResult, credits: CreditsInfo | null) => void
  onError: (message: string, needsUpgrade?: boolean) => void
}

/** Streams a generation from /api/generate, handling SSE + JSON error envelopes. */
export async function runGenerationStream(
  toolId: string,
  inputs: Record<string, string>,
  cbs: GenerateCallbacks
): Promise<void> {
  let res: Response
  try {
    res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ toolId, inputs }),
    })
  } catch {
    cbs.onError('Network error. Please check your connection and try again.')
    return
  }

  const contentType = res.headers.get('content-type') || ''
  if (!res.ok || !contentType.includes('text/event-stream')) {
    let json: any = null
    try {
      json = await res.json()
    } catch {
      json = null
    }
    cbs.onError(json?.error || 'Generation failed. Please try again.', Boolean(json?.needsUpgrade))
    return
  }

  if (!res.body) {
    cbs.onError('No response stream received. Please try again.')
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let partial = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    partial += decoder.decode(value, { stream: true })
    const lines = partial.split('\n')
    partial = lines.pop() ?? ''
    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const data = t.slice(5).trim()
      if (!data) continue
      try {
        const parsed = JSON.parse(data)
        if (parsed.status === 'processing') {
          cbs.onProgress?.(parsed.message || 'Generating…')
        } else if (parsed.status === 'completed') {
          cbs.onComplete(parsed.result, parsed.credits ?? null)
          return
        } else if (parsed.status === 'error') {
          cbs.onError(parsed.message || 'Generation failed. Please try again.')
          return
        }
      } catch {
        // ignore malformed keep-alive lines
      }
    }
  }
}
