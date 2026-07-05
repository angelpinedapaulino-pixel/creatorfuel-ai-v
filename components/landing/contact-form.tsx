'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Send, User, Mail, Type, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api-client'

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      setDone(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      toast.success('Message sent! We will get back to you soon.')
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not send your message.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card p-10 text-center shadow-sm">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="font-display text-xl font-semibold">
          Thanks for reaching out!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your message has been received. Our team will get back to you shortly.
        </p>
        <Button variant="outline" onClick={() => setDone(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cf-name">Name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cf-name"
              required
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                update('name', e.target.value)
              }
              placeholder="Your name"
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cf-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cf-email"
              type="email"
              required
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                update('email', e.target.value)
              }
              placeholder="you@company.com"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-subject">Subject</Label>
        <div className="relative">
          <Type className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="cf-subject"
            required
            value={form.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              update('subject', e.target.value)
            }
            placeholder="How can we help?"
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cf-message">Message</Label>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="cf-message"
            required
            rows={5}
            value={form.message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              update('message', e.target.value)
            }
            placeholder="Tell us a bit more..."
            className="pl-10"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Your details are stored securely and only used to respond to your enquiry.
      </p>

      <Button
        type="submit"
        size="lg"
        loading={submitting}
        className="w-full sm:w-auto sm:self-start"
      >
        <Send className="h-4 w-4" /> Send message
      </Button>
    </form>
  )
}