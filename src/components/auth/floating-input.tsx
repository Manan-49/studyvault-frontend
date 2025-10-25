'use client'

import { useState, InputHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  isValid?: boolean
}

export function FloatingInput({
  label,
  error,
  icon,
  isValid,
  className = '',
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)
    props.onChange?.(e)
  }

  const isFloating = isFocused || hasValue || props.value

  return (
    <div className="relative w-full">
      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          {...props}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          className={`
            peer h-14 w-full rounded-xl border-2 bg-white py-4 text-gray-900 
            transition-all duration-200 outline-none
            dark:bg-gray-900 dark:text-white
            ${icon ? 'pl-12' : 'pl-4'}
            ${isValid ? 'pr-12' : error ? 'pr-12' : 'pr-4'}
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : isValid
                  ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:focus:border-blue-500'
            }
            ${className}
          `}
        />

        {/* Floating Label */}
        <motion.label
          initial={false}
          animate={{
            top: isFloating ? '0.5rem' : '50%',
            translateY: isFloating ? '0%' : '-50%',
            fontSize: isFloating ? '0.6875rem' : '0.875rem',
            fontWeight: isFloating ? '500' : '400',
          }}
          style={{
            color: error
              ? '#ef4444'
              : isFocused
                ? '#3b82f6'
                : '#9ca3af',
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={`
            pointer-events-none absolute 
            ${icon ? 'left-12' : 'left-4'}
          `}
        >
          {label}
        </motion.label>

        {/* Validation Icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isValid && !error && (
              <motion.div
                key="valid"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <AlertCircle className="h-5 w-5 text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
          >
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: [-3, 3, -3, 3, 0] }}
              transition={{ duration: 0.4 }}
            >
              {error}
            </motion.span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}