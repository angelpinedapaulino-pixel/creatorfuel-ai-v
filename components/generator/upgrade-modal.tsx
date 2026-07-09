'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Crown, Check, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PLANS } from '@/lib/constants'

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const paid = PLANS.filter((p) => p.id !== 'FREE')
  const [selectedPlan, setSelectedPlan] = useState('STARTER')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
        <DialogHeader>
          <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-white">
            <Crown className="h-6 w-6" />
          </div>

          <DialogTitle className="font-display text-xl">
            You have used all your free credits.
          </DialogTitle>

          <DialogDescription className="text-zinc-300">
            Upgrade to keep generating on-brand content — unlock complete outputs and more monthly credits.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2 sm:grid-cols-2">
          {paid.map((plan) => (
            <button
  key={plan.id}
  type="button"
  onClick={() => setSelectedPlan(plan.id)}
              className={`w-full rounded-2xl border p-4 text-left cursor-pointer transition-all duration-200 ${
  selectedPlan === plan.id
    ? 'border-violet-500 bg-violet-500/20 ring-2 ring-violet-500 scale-[1.02]'
    : 'border-zinc-700 bg-zinc-800 hover:border-violet-500 hover:bg-zinc-700'
}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold">
                  {plan.name}
                </span>

                {selectedPlan === plan.id && (
  <Zap className="h-4 w-4 text-violet-400" />
)}
              </div>

              <div className="mt-1">
                <span className="font-display text-2xl font-bold">
                  ${plan.price}
                </span>

                <span className="text-xs text-zinc-400">
                  /{plan.period}
                </span>
              </div>

              <p className="mt-1 text-xs font-medium text-primary">
                {plan.credits}
              </p>

              <ul className="mt-3 space-y-1.5">
                {plan.features.slice(0, 3).map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-1.5 text-xs text-zinc-300"
                  >
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
  className="w-full h-12 text-base font-semibold"
  onClick={() => {
    console.log(selectedPlan)
  }}
>
  {selectedPlan === 'STARTER'
    ? 'Upgrade to STARTER'
    : 'Upgrade to EMPIRE'}
</Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}