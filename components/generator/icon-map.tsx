'use client'

import {
  Flame,
  Anchor,
  Type,
  AlignLeft,
  MousePointerClick,
  Clapperboard,
  CalendarDays,
  Sparkles,
  Globe,
  Music2,
  type LucideIcon,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  Flame,
  Anchor,
  Type,
  AlignLeft,
  MousePointerClick,
  Clapperboard,
  CalendarDays,
  Sparkles,
}

export function ToolIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = MAP[name] ?? Sparkles
  return <Icon className={className} />
}

const PLATFORM_ICON: Record<string, LucideIcon> = {
  YouTube: Globe,
  Instagram: Globe,
  TikTok: Music2,
  Twitter: Globe,
  LinkedIn: Globe,
  Facebook: Globe,
  'All Platforms': Globe,
}

export function PlatformIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = PLATFORM_ICON[name] ?? Globe
  return <Icon className={className} />
}
