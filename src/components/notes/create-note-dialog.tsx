'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, FileText } from 'lucide-react'

interface CreateNoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (title: string) => Promise<void>
  isLoading: boolean
}

export function CreateNoteDialog({ isOpen, onClose, onCreate, isLoading }: CreateNoteDialogProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await onCreate(title)
    setTitle('')
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
              className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Note</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Note Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Study Notes, Meeting Minutes"
                  autoFocus
                  disabled={isLoading}
                  className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !title.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Create Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}