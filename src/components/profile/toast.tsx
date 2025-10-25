// src/components/profile/toast.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className={`
          flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-sm
          ${type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
          }
        `}>
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          
          <span className="font-medium">{message}</span>
          
          <button
            onClick={onClose}
            className="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}