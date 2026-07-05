import type { Metadata } from 'next'
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'

export const dynamic = 'force-dynamic'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'CreatorFuel AI — AI-powered content creation',
    template: '%s | CreatorFuel AI',
  },

  description:
    'CreatorFuel AI is an AI-powered content creation platform that helps creators and businesses generate on-brand content across every major platform.',

  keywords: [
    'AI content creation',
    'content generator',
    'social media content',
    'creators',
    'marketing',
    'CreatorFuel AI',
  ],

  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },

  openGraph: {
    title: 'CreatorFuel AI — AI-powered content creation',
    description:
      'Generate on-brand content for YouTube, Instagram, TikTok, Twitter, LinkedIn, Facebook and more — powered by your own Business Brain.',
    url: siteUrl,
    siteName: 'CreatorFuel AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CreatorFuel AI',
      },
    ],
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async />
      </head>
      <body
        className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <Providers>
          {children}
          <Toaster />

          {/* IMPORTANT: Do not remove — handles chunk loading race conditions in the dev server */}
          <ChunkLoadErrorHandler />
        </Providers>
      </body>
    </html>
  )
}