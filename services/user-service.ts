import { prisma } from '@/lib/db'
import type { SettingsData } from '@/types'

/** Creates default Credits, Settings and a FREE Subscription for a brand-new user. */
export async function provisionNewUser(userId: string): Promise<void> {
  const resetDate = new Date()
  resetDate.setDate(resetDate.getDate() + 30)

  await prisma.$transaction([
    prisma.credits.upsert({
      where: { userId },
      update: {},
      create: { userId, total: 5, used: 0, remaining: 5, resetDate },
    }),
    prisma.settings.upsert({
      where: { userId },
      update: {},
      create: { userId, theme: 'dark', notifications: true, language: 'English', timezone: 'UTC' },
    }),
    prisma.subscription.upsert({
      where: { userId },
      update: {},
      create: { userId, plan: 'FREE', status: 'ACTIVE', startDate: new Date() },
    }),
  ])
}

export async function getSettings(userId: string): Promise<SettingsData> {
  let settings = await prisma.settings.findUnique({ where: { userId } })
  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId, theme: 'dark', notifications: true, language: 'English', timezone: 'UTC' },
    })
  }
  return {
    theme: settings?.theme ?? 'dark',
    notifications: settings?.notifications ?? true,
    language: settings?.language ?? 'English',
    timezone: settings?.timezone ?? 'UTC',
  }
}

export async function updateSettings(userId: string, data: Partial<SettingsData>): Promise<SettingsData> {
  const settings = await prisma.settings.upsert({
    where: { userId },
    update: {
      ...(data.theme !== undefined ? { theme: data.theme } : {}),
      ...(data.notifications !== undefined ? { notifications: data.notifications } : {}),
      ...(data.language !== undefined ? { language: data.language } : {}),
      ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
    },
    create: {
      userId,
      theme: data.theme ?? 'dark',
      notifications: data.notifications ?? true,
      language: data.language ?? 'English',
      timezone: data.timezone ?? 'UTC',
    },
  })
  return {
    theme: settings?.theme ?? 'dark',
    notifications: settings?.notifications ?? true,
    language: settings?.language ?? 'English',
    timezone: settings?.timezone ?? 'UTC',
  }
}
