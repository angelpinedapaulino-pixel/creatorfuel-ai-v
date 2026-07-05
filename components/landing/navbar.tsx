'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const { user, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3">
      <div
        className={cn(
          'w-full max-w-[1200px] rounded-2xl transition-all duration-normal',
          scrolled ? 'bg-card/80 backdrop-blur-xl shadow-lg border border-border/60' : 'bg-transparent border border-transparent'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="CreatorFuel AI home">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {!loading && user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-accent lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border/60 p-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                {!loading && user ? (
                  <Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
                ) : (
                  <>
                    <Button asChild variant="outline"><Link href="/login">Log in</Link></Button>
                    <Button asChild><Link href="/signup">Get Started</Link></Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
