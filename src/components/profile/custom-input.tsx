'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Eye, EyeOff } from 'lucide-react'

interface CustomInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  icon: LucideIcon
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  error?: string
}

export default function CustomInput({
  label,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  placeholder,
  error,
}: CustomInputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className={`h-5 w-5 transition-colors ${
            focused ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
          }`} />
        </div>

        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-11 pr-12 py-3 rounded-lg border-2 transition-all outline-none
            ${focused 
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400' 
              : error 
                ? 'border-red-300 bg-red-50/50 dark:bg-red-900/10 dark:border-red-400'
                : 'border-border bg-background/50 hover:border-border'
            }
            text-foreground placeholder:text-muted-foreground
          `}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}

        {focused && (
          <motion.div
            layoutId="input-border"
            className="absolute inset-0 rounded-lg border-2 border-blue-500 dark:border-blue-400 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}