'use client'

import { motion } from 'framer-motion'
import { FileText, Sparkles } from 'lucide-react'

interface EmptyNotesStateProps {
  onCreateNote: () => void
}

export function EmptyNotesState({ onCreateNote }: EmptyNotesStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex h-full items-center justify-center p-8"
    >
      <div className="max-w-md text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl"
        >
          <FileText className="h-12 w-12 text-white" />
        </motion.div>

        <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          No note selected
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Select a note from the sidebar or create a new one to get started
        </p>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateNote}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
        >
          <Sparkles className="h-5 w-5" />
          Create Your First Note
        </motion.button>
      </div>
    </motion.div>
  )
}