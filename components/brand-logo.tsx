import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  showText = true,
  size = 'md',
}: {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const box = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  const icon = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const text = size === 'lg' ? 'text-xl' : 'text-lg'
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('grid place-items-center rounded-xl brand-gradient brand-glow shrink-0', box)}>
        <Flame className={cn('text-white', icon)} />
      </span>
      {showText && (
        <span className={cn('font-display font-bold tracking-tight text-foreground', text)}>
          CreatorFuel <span className="brand-gradient-text">AI</span>
        </span>
      )}
    </span>
  )
}
