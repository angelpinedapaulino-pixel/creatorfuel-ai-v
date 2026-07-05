'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BrandLogo } from '@/components/brand-logo'
import { useAuth } from '@/hooks/use-auth'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      await signup(name, email, password)
      toast.success('Account created! Welcome to CreatorFuel AI.')
      router.replace('/dashboard')
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not create your account.')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-center pt-8">
        <Link href="/">
          <BrandLogo size="lg" />
        </Link>
      </div>

      <AuthLayout
        title="Create your account"
        description="Start creating on-brand content for free"
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4">

          {/* NAME */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                required
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Jane Creator"
                className="pl-10"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="you@company.com"
                className="pl-10"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="At least 6 characters"
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
            Create account <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>
        </div>
      </AuthLayout>
    </div>
  )
}