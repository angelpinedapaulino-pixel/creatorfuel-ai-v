export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { ok, fail, serverError, isValidEmail } from '@/lib/api'
import { createContactSubmission } from '@/services/contact-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = (body?.name ?? '').toString().trim()
    const email = (body?.email ?? '').toString().trim()
    const subject = (body?.subject ?? '').toString().trim()
    const message = (body?.message ?? '').toString().trim()

    if (!name) return fail('Please enter your name.')
    if (!isValidEmail(email)) return fail('Please enter a valid email address.')
    if (!subject) return fail('Please enter a subject.')
    if (message.length < 10) return fail('Please enter a message of at least 10 characters.')

    const submission = await createContactSubmission({ name, email, subject, message })
    return ok({ id: submission.id, message: 'Thanks for reaching out! We will get back to you soon.' }, 201)
  } catch (err) {
    console.error('Contact submission error:', err)
    return serverError('Could not send your message. Please try again.')
  }
}
