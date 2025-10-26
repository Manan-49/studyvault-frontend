'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  show: boolean
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function ToastSimple({ show, message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed left-0 right-0 top-6 z-50 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="w-full max-w-md"
          >
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-4 shadow-2xl backdrop-blur-xl sm:px-6 ${
                type === 'success'
                  ? 'border-green-200 bg-green-50/90 dark:border-green-900 dark:bg-green-900/30'
                  : 'border-red-200 bg-red-50/90 dark:border-red-900 dark:bg-red-900/30'
              }`}
            >
              {type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400 sm:h-6 sm:w-6" />
              ) : (
                <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 sm:h-6 sm:w-6" />
              )}
              <p
                className={`flex-1 text-sm font-medium sm:text-base ${
                  type === 'success'
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}
              >
                {message}
              </p>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}