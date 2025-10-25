'use client'

import { motion } from 'framer-motion'

export function BackgroundDecoration() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Blur Orb 1 - Top Right */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"
      />

      {/* Blur Orb 2 - Bottom Left */}
      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"
      />

      {/* Blur Orb 3 - Center */}
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl"
      />
    </div>
  )
}