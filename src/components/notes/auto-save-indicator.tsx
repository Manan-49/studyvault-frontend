'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle } from 'lucide-react'

interface AutoSaveIndicatorProps {
  isSaving: boolean
}

export function AutoSaveIndicator({ isSaving }: AutoSaveIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {isSaving ? (
        <motion.div
          key="saving"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </motion.div>
      ) : (
        <motion.div
          key="saved"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Saved</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}