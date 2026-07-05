'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.06,
    },
  }),
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="hero-gradient relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 grid-pattern opacity-40" />

        <div className="relative mx-auto max-w-[1200px] px-4 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
          >
            <Badge className="mb-6">
              <Zap className="mr-2 h-4 w-4" />
              AI content creation
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            custom={1}
            variants={fadeUp}
            className="mx-auto max-w-4xl text-4xl font-bold sm:text-6xl"
          >
            Fuel your content engine with AI
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            custom={2}
            variants={fadeUp}
            className="mt-6 text-muted-foreground"
          >
            Create content faster with AI.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={3}
            variants={fadeUp}
            className="mt-8 flex justify-center gap-3"
          >
            <Button asChild>
              <Link href="/signup">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}