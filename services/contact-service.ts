import { prisma } from '@/lib/db'

export async function createContactSubmission(input: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<{ id: string }> {
  const submission = await prisma.contactSubmission.create({
    data: {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    },
    select: { id: true },
  })
  return submission
}
