'use client'

import { ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps extends HTMLMotionProps<"button"> {
  isLoading?: boolean
  children: React.ReactNode
}

export function GradientButton({
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`
        relative h-12 w-full overflow-hidden rounded-xl font-semibold text-white
        shadow-lg transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
      {...props}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />

      {/* Hover Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
        initial={{ x: '100%' }}
        whileHover={{ x: disabled ? '100%' : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {children}
      </span>

      {/* Shine Effect */}
      {!disabled && !isLoading && (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      )}
    </motion.button>
  )
}