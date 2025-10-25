'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Move, FolderOpen, Loader2, Home } from 'lucide-react'

interface MoveFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onMove: (folderId: string | null) => Promise<void>
  folders: Array<{ id: string; name: string; path: string }>
  isLoading: boolean
}

export function MoveFileDialog({
  isOpen,
  onClose,
  onMove,
  folders,
  isLoading,
}: MoveFileDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onMove(selectedFolderId || null)
    setSelectedFolderId('')
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
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2.5">
                    <Move className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Move File
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
                    htmlFor="destination"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Select Destination
                  </label>
                  <div className="relative">
                    <FolderOpen className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <select
                      id="destination"
                      value={selectedFolderId}
                      onChange={(e) => setSelectedFolderId(e.target.value)}
                      disabled={isLoading}
                      className="h-12 w-full appearance-none rounded-xl border-2 border-gray-200 bg-white pl-12 pr-10 text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">📁 Root (No Folder)</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          📁 {folder.path}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedFolderId === '' && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Home className="h-3 w-3" />
                      File will be moved to the root directory
                    </p>
                  )}
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
                    disabled={isLoading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Move File
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