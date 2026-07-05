export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ok, fail, unauthorized, serverError } from '@/lib/api'
import { getBusinessBrain, upsertBusinessBrain } from '@/services/business-brain-service'
import { logActivity } from '@/services/history-service'
import type { BusinessBrainData } from '@/types'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const brain = await getBusinessBrain(user.id)
    return ok({ brain })
  } catch (err) {
    console.error('Get business brain error:', err)
    return serverError('Could not load your Business Brain.')
  }
}

async function save(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const body = await req.json().catch(() => ({}))
  const businessName = (body?.businessName ?? '').toString().trim()
  if (!businessName) return fail('Business name is required.')

  const data: BusinessBrainData = {
    businessName,
    businessDescription: (body?.businessDescription ?? '').toString(),
    industry: (body?.industry ?? '').toString(),
    products: (body?.products ?? '').toString(),
    services: (body?.services ?? '').toString(),
    targetAudience: (body?.targetAudience ?? '').toString(),
    country: (body?.country ?? '').toString(),
    language: (body?.language ?? 'English').toString(),
    brandVoice: (body?.brandVoice ?? 'Professional').toString(),
    contentGoals: Array.isArray(body?.contentGoals) ? body.contentGoals.map((g: unknown) => String(g)) : [],
    preferredPlatforms: Array.isArray(body?.preferredPlatforms)
      ? body.preferredPlatforms.map((p: unknown) => String(p))
      : [],
  }

  const { brain, created } = await upsertBusinessBrain(user.id, data)
  await logActivity({
    userId: user.id,
    action: created ? 'Business Brain created' : 'Business Brain updated',
    details: `${created ? 'Set up' : 'Updated'} the profile for \"${businessName}\".`,
  })
  return ok({ brain, created }, created ? 201 : 200)
}

export async function POST(req: NextRequest) {
  try {
    return await save(req)
  } catch (err) {
    console.error('Save business brain error:', err)
    return serverError('Could not save your Business Brain.')
  }
}

export async function PUT(req: NextRequest) {
  try {
    return await save(req)
  } catch (err) {
    console.error('Update business brain error:', err)
    return serverError('Could not update your Business Brain.')
  }
}
