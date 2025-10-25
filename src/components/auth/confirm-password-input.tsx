'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Check, AlertCircle, X } from 'lucide-react'

interface ConfirmPasswordInputProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  isValid?: boolean
  passwordMatch?: boolean
  placeholder?: string
  autoComplete?: string
}

export function ConfirmPasswordInput({
  label,
  value,
  onChange,
  error,
  isValid,
  passwordMatch,
  placeholder,
  autoComplete = 'new-password',
}: ConfirmPasswordInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isFloating = isFocused || value.length > 0

  return (
    <div className="relative w-full">
      {/* Input Container */}
      <div className="relative">
        {/* Lock Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <Lock className="h-5 w-5" />
        </div>

        {/* Input */}
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`
            peer h-14 w-full rounded-xl border-2 bg-white py-4 pl-12 pr-20 text-gray-900
            transition-all duration-200 outline-none
            dark:bg-gray-900 dark:text-white
            ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                : isValid && passwordMatch
                  ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:focus:border-blue-500'
            }
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
          className="pointer-events-none absolute left-12"
        >
          {label}
        </motion.label>

        {/* Right Side Icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Validation Icon */}
          <AnimatePresence mode="wait">
            {isValid && passwordMatch && !error && (
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
            {isValid && !passwordMatch && value.length > 0 && !error && (
              <motion.div
                key="mismatch"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                  <X className="h-4 w-4 text-white" />
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

          {/* Toggle Password Visibility */}
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <AnimatePresence mode="wait" initial={false}>
              {showPassword ? (
                <motion.div
                  key="eye-off"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <EyeOff className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="eye"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Eye className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Error or Match Message */}
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
        {!error && value.length > 0 && !passwordMatch && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 flex items-center gap-1 text-xs text-orange-500"
          >
            Passwords don't match
          </motion.p>
        )}
        {!error && passwordMatch && value.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 flex items-center gap-1 text-xs text-green-500"
          >
            <Check className="h-3 w-3" />
            Passwords match
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}