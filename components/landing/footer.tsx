'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

export function Footer() {
  const year = 2026

  const icons = [Globe, Globe, Globe, Globe, Globe]

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <BrandLogo size="lg" />

          <p className="max-w-md text-sm text-muted-foreground">
            AI-powered content creation for creators &amp; businesses. Turn your brand knowledge into
            on-brand content for every platform.
          </p>

          <div className="flex items-center gap-4">
            {icons.map((Icon, i) => (
              <span
                key={i}
                className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#contact" className="hover:text-foreground">
              Contact
            </a>
            <Link href="/signup" className="hover:text-foreground">
              Get Started
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; {year} CreatorFuel AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}