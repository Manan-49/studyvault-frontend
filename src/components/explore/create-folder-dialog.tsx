'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderPlus, Loader2 } from 'lucide-react'

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
  isLoading: boolean
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return
    await onCreate(folderName)
    setFolderName('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5">
                    <FolderPlus className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Create New Folder
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <label
                    htmlFor="folder-name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Folder Name
                  </label>
                  <input
                    id="folder-name"
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="e.g., Math Notes, Physics 101"
                    autoFocus
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading || !folderName.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Create Folder
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}