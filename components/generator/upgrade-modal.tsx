'use client'

import Link from 'next/link'
import { Crown, Check, Zap } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PLANS } from '@/lib/constants'

export function UpgradeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const paid = PLANS.filter((p) => p.id !== 'FREE')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-white">
            <Crown className="h-6 w-6" />
          </div>
          <DialogTitle className="font-display text-xl">You have used all your free credits.</DialogTitle>
          <DialogDescription>
            Upgrade to keep generating on-brand content — unlock complete outputs and more monthly credits.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2 sm:grid-cols-2">
          {paid.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-4 ${plan.highlighted ? 'border-primary bg-primary/5' : 'border-border bg-secondary/40'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold">{plan.name}</span>
                {plan.highlighted && <Zap className="h-4 w-4 text-primary" />}
              </div>
              <div className="mt-1">
                <span className="font-display text-2xl font-bold">${plan.price}</span>
                <span className="text-xs text-muted-foreground">/{plan.period}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-primary">{plan.credits}</p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full">
            <Link href="/#pricing">Upgrade to STARTER</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/#pricing">Upgrade to EMPIRE</Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
