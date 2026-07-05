export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest } from 'next/server'
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

  const apiKey = process.env.ABACUSAI_API_KEY
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

        const llmRes = await fetch('https://apps.abacus.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: GENERATION_MODEL,
            messages,
            stream: true,
            temperature: 0.9,
            max_tokens: 8000,
            response_format: { type: 'json_object' },
          }),
        })

        if (!llmRes.ok || !llmRes.body) {
          const errText = await llmRes.text().catch(() => '')
          console.error('LLM API error:', llmRes.status, errText)
          send({ status: 'error', message: 'The AI service is temporarily unavailable. Please try again.' })
          controller.close()
          return
        }

        const reader = llmRes.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let partialRead = ''
        let ticks = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          partialRead += decoder.decode(value, { stream: true })
          const lines = partialRead.split('\n')
          partialRead = lines.pop() ?? ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed?.choices?.[0]?.delta?.content
              if (delta) {
                buffer += delta
                ticks++
                if (ticks % 8 === 0) send({ status: 'processing', message: 'Writing your content…' })
              }
            } catch {
              // ignore keep-alive / non-JSON lines
            }
          }
        }

        if (!buffer.trim()) {
          send({ status: 'error', message: 'The AI returned an empty response. Please try again.' })
          controller.close()
          return
        }

        let items
        try {
          items = parseGeneration(tool, buffer, limits)
        } catch (parseErr: any) {
          console.error('Generation parse error:', parseErr?.message)
          send({ status: 'error', message: parseErr?.message || 'Could not parse the AI response. Please try again.' })
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
