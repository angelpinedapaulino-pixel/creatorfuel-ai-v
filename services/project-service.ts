import { prisma } from '@/lib/db'
import type { ProjectItem } from '@/types'

export function serializeProject(p: any): ProjectItem {
  return {
    id: p?.id ?? '',
    title: p?.title ?? '',
    description: p?.description ?? '',
    type: p?.type ?? 'blog_post',
    status: p?.status ?? 'DRAFT',
    content: p?.content ?? '',
    createdAt: (p?.createdAt ?? new Date()).toISOString?.() ?? '',
    updatedAt: (p?.updatedAt ?? new Date()).toISOString?.() ?? '',
  }
}

export async function listProjects(userId: string): Promise<ProjectItem[]> {
  const rows = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return (rows ?? []).map(serializeProject)
}

export async function createProject(userId: string, input: {
  title: string
  description?: string
  type?: string
  status?: string
  content?: string
}): Promise<ProjectItem> {
  const project = await prisma.project.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? '',
      type: input.type ?? 'blog_post',
      status: input.status ?? 'DRAFT',
      content: input.content ?? '',
    },
  })
  return serializeProject(project)
}

export async function getProject(userId: string, id: string): Promise<ProjectItem | null> {
  const project = await prisma.project.findFirst({ where: { id, userId } })
  return project ? serializeProject(project) : null
}

export async function updateProject(
  userId: string,
  id: string,
  input: { title?: string; description?: string; type?: string; status?: string; content?: string }
): Promise<ProjectItem | null> {
  const existing = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } })
  if (!existing) return null
  const data: Record<string, unknown> = {}
  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description
  if (input.type !== undefined) data.type = input.type
  if (input.status !== undefined) data.status = input.status
  if (input.content !== undefined) data.content = input.content
  const project = await prisma.project.update({ where: { id }, data })
  return serializeProject(project)
}

export async function deleteProject(userId: string, id: string): Promise<boolean> {
  const existing = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } })
  if (!existing) return false
  await prisma.project.delete({ where: { id } })
  return true
}

export async function duplicateProject(userId: string, id: string): Promise<ProjectItem | null> {
  const src = await prisma.project.findFirst({ where: { id, userId } })
  if (!src) return null
  const copy = await prisma.project.create({
    data: {
      userId,
      title: `${src.title} (Copy)`,
      description: src.description,
      type: src.type,
      status: src.status,
      content: src.content,
    },
  })
  return serializeProject(copy)
}
