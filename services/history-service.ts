import { prisma } from '@/lib/db'
import type { HistoryItem } from '@/types'

export async function logActivity(params: {
  userId: string
  action: string
  details?: string
  projectId?: string | null
  metadata?: Record<string, unknown> | null
}): Promise<void> {
  try {
    await prisma.history.create({
      data: {
        userId: params.userId,
        action: params.action,
        details: params.details ?? '',
        projectId: params.projectId ?? null,
        metadata: (params.metadata ?? undefined) as any,
      },
    })
  } catch (err) {
    // Activity logging should never break the primary action.
    console.error('Failed to log activity:', err)
  }
}

export function serializeHistory(h: any): HistoryItem {
  return {
    id: h?.id ?? '',
    action: h?.action ?? '',
    details: h?.details ?? '',
    projectId: h?.projectId ?? null,
    metadata: h?.metadata ?? null,
    createdAt: (h?.createdAt ?? new Date()).toISOString?.() ?? '',
  }
}

export async function listHistory(userId: string, limit = 100): Promise<HistoryItem[]> {
  const rows = await prisma.history.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return (rows ?? []).map(serializeHistory)
}

export async function deleteHistory(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.history.findFirst({ where: { id, userId }, select: { id: true } })
  if (!existing) return false
  await prisma.history.delete({ where: { id } })
  return true
}
