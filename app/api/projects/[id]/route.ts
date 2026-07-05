export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ok, fail, unauthorized, serverError } from '@/lib/api'
import { getProject, updateProject, deleteProject } from '@/services/project-service'
import { logActivity } from '@/services/history-service'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const project = await getProject(user.id, params.id)
    if (!project) return fail('Project not found.', 404)
    return ok({ project })
  } catch (err) {
    console.error('Get project error:', err)
    return serverError('Could not load this project.')
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await req.json().catch(() => ({}))
    const input: Record<string, string> = {}
    if (body?.title !== undefined) {
      const t = body.title.toString().trim()
      if (!t) return fail('Title cannot be empty.')
      input.title = t
    }
    if (body?.description !== undefined) input.description = body.description.toString()
    if (body?.type !== undefined) input.type = body.type.toString()
    if (body?.status !== undefined) input.status = body.status.toString()
    if (body?.content !== undefined) input.content = body.content.toString()

    const project = await updateProject(user.id, params.id, input)
    if (!project) return fail('Project not found.', 404)

    await logActivity({
      userId: user.id,
      action: 'Project updated',
      details: `Updated “${project.title}”.`,
      projectId: project.id,
    })
    return ok({ project })
  } catch (err) {
    console.error('Update project error:', err)
    return serverError('Could not update this project.')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const deleted = await deleteProject(user.id, params.id)
    if (!deleted) return fail('Project not found.', 404)
    await logActivity({ userId: user.id, action: 'Project deleted', details: 'Removed a project.' })
    return ok({ deleted: true })
  } catch (err) {
    console.error('Delete project error:', err)
    return serverError('Could not delete this project.')
  }
}
