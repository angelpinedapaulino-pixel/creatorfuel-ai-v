import { prisma } from '@/lib/db'
import type { DashboardStats } from '@/types'
import { serializeProject } from './project-service'
import { serializeHistory } from './history-service'

export async function getDashboardStats(user: {
  id: string
  email: string
  name: string
  avatar: string | null
  role: string
}): Promise<DashboardStats> {
  const [credits, subscription, recentProjects, recentHistory, projectCount, completedCount, historyCount, brain] =
    await Promise.all([
      prisma.credits.findUnique({ where: { userId: user.id } }),
      prisma.subscription.findUnique({ where: { userId: user.id } }),
      prisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.history.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.project.count({ where: { userId: user.id } }),
      prisma.project.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      prisma.history.count({ where: { userId: user.id } }),
      prisma.businessBrain.findUnique({ where: { userId: user.id }, select: { id: true } }),
    ])

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    },
    credits: credits
      ? {
          total: credits.total ?? 0,
          used: credits.used ?? 0,
          remaining: credits.remaining ?? 0,
          resetDate: (credits.resetDate ?? new Date()).toISOString(),
        }
      : null,
    subscription: subscription
      ? {
          plan: subscription.plan ?? 'FREE',
          status: subscription.status ?? 'ACTIVE',
          startDate: (subscription.startDate ?? new Date()).toISOString(),
          endDate: subscription.endDate ? subscription.endDate.toISOString() : null,
        }
      : null,
    recentProjects: (recentProjects ?? []).map(serializeProject),
    recentHistory: (recentHistory ?? []).map(serializeHistory),
    totals: {
      projects: projectCount ?? 0,
      completedProjects: completedCount ?? 0,
      historyCount: historyCount ?? 0,
      hasBusinessBrain: Boolean(brain),
    },
  }
}
