import { prisma } from '@/lib/db'
import type { BusinessBrainData } from '@/types'

export function serializeBrain(b: any): BusinessBrainData | null {
  if (!b) return null
  return {
    businessName: b?.businessName ?? '',
    businessDescription: b?.businessDescription ?? '',
    industry: b?.industry ?? '',
    products: b?.products ?? '',
    services: b?.services ?? '',
    targetAudience: b?.targetAudience ?? '',
    country: b?.country ?? '',
    language: b?.language ?? 'English',
    brandVoice: b?.brandVoice ?? 'Professional',
    contentGoals: Array.isArray(b?.contentGoals) ? b.contentGoals : [],
    preferredPlatforms: Array.isArray(b?.preferredPlatforms) ? b.preferredPlatforms : [],
  }
}

export async function getBusinessBrain(userId: string): Promise<BusinessBrainData | null> {
  const brain = await prisma.businessBrain.findUnique({ where: { userId } })
  return serializeBrain(brain)
}

export async function upsertBusinessBrain(
  userId: string,
  data: BusinessBrainData
): Promise<{ brain: BusinessBrainData; created: boolean }> {
  const existing = await prisma.businessBrain.findUnique({ where: { userId } })
  const payload = {
    businessName: data.businessName ?? '',
    businessDescription: data.businessDescription ?? '',
    industry: data.industry ?? '',
    products: data.products ?? '',
    services: data.services ?? '',
    targetAudience: data.targetAudience ?? '',
    country: data.country ?? '',
    language: data.language ?? 'English',
    brandVoice: data.brandVoice ?? 'Professional',
    contentGoals: Array.isArray(data.contentGoals) ? data.contentGoals : [],
    preferredPlatforms: Array.isArray(data.preferredPlatforms) ? data.preferredPlatforms : [],
  }
  const brain = await prisma.businessBrain.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload },
  })
  return { brain: serializeBrain(brain)!, created: !existing }
}
