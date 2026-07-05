'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { copyText } from '@/lib/clipboard'

interface CopyButtonProps {
  text: string
  label?: string
  copiedLabel?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'icon'
  className?: string
  showToast?: boolean
}

export function CopyButton({
  text,
  label,
  copiedLabel = 'Copied',
  variant = 'ghost',
  size = 'icon',
  className,
  showToast = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    const okc = await copyText(text)
    if (okc) {
      setCopied(true)
      if (showToast) toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1600)
    } else {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  return (
    <Button type="button" variant={variant} size={size} className={cn(className)} onClick={onCopy} aria-label={label ?? 'Copy'}>
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      {size !== 'icon' && <span className="ml-1.5">{copied ? copiedLabel : label ?? 'Copy'}</span>}
    </Button>
  )
}
