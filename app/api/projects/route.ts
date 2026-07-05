export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ok, fail, unauthorized, serverError } from '@/lib/api'
import { listProjects, createProject, duplicateProject } from '@/services/project-service'
import { logActivity } from '@/services/history-service'
import { projectTypeLabel } from '@/lib/constants'
import { generatorToolName } from '@/lib/generators'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const projects = await listProjects(user.id)
    return ok({ projects })
  } catch (err) {
    console.error('List projects error:', err)
    return serverError('Could not load your projects.')
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await req.json().catch(() => ({}))

    // Duplicate flow
    const duplicateFrom = (body?.duplicateFrom ?? '').toString().trim()
    if (duplicateFrom) {
      const copy = await duplicateProject(user.id, duplicateFrom)
      if (!copy) return fail('Original project not found.', 404)
      await logActivity({
        userId: user.id,
        action: 'Project duplicated',
        details: `Duplicated “${copy.title}”.`,
        projectId: copy.id,
        metadata: { type: copy.type },
      })
      return ok({ project: copy }, 201)
    }

    const title = (body?.title ?? '').toString().trim()
    const description = (body?.description ?? '').toString().trim()
    const type = (body?.type ?? 'blog_post').toString()
    const status = (body?.status ?? 'DRAFT').toString()
    const content = (body?.content ?? '').toString()

    if (!title) return fail('Please give your project a title.')

    const project = await createProject(user.id, { title, description, type, status, content })
    const label = generatorToolName(type) ?? projectTypeLabel(type)
    await logActivity({
      userId: user.id,
      action: 'Project saved',
      details: `Saved “${title}” (${label}).`,
      projectId: project.id,
      metadata: { type, status },
    })
    return ok({ project }, 201)
  } catch (err) {
    console.error('Create project error:', err)
    return serverError('Could not create your project.')
  }
}
