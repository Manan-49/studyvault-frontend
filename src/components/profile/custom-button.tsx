// src/components/profile/custom-button.tsx
'use client'

import { motion } from 'framer-motion'
import { LucideIcon, Loader2 } from 'lucide-react'

interface CustomButtonProps {
  children: React.ReactNode
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: LucideIcon
  className?: string
}

export default function CustomButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon: Icon,
  className = '',
}: CustomButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/30',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        px-6 py-3 rounded-lg font-medium transition-all
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  )
}