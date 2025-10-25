'use client'

import { motion } from 'framer-motion'
import { FolderOpen, Upload, Search } from 'lucide-react'

interface EmptyStateProps {
  type: 'search' | 'empty'
  searchTerm?: string
  onUpload?: () => void
  onCreateFolder?: () => void
}

export function EmptyState({ type, searchTerm, onUpload, onCreateFolder }: EmptyStateProps) {
  if (type === 'search') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-900/50"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="mb-4 rounded-full bg-gray-200 p-6 dark:bg-gray-800"
        >
          <Search className="h-12 w-12 text-gray-400" />
        </motion.div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          No results found
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400">
          No files or folders match <span className="font-semibold">"{searchTerm}"</span>
          <br />
          Try a different search term
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 py-16 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-8 shadow-2xl"
      >
        <FolderOpen className="h-16 w-16 text-white" />
      </motion.div>

      <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        This folder is empty
      </h3>
      <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
        Upload files or create folders to get started
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        {onUpload && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpload}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
          >
            <Upload className="h-5 w-5" />
            Upload Files
          </motion.button>
        )}
        {onCreateFolder && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateFolder}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            <FolderOpen className="h-5 w-5" />
            New Folder
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}