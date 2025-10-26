'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Loader2 } from 'lucide-react'

interface MarkdownImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (title: string, markdown: string) => Promise<void>
  isLoading: boolean
}

export function MarkdownImportDialog({
  isOpen,
  onClose,
  onImport,
  isLoading,
}: MarkdownImportDialogProps) {
  const [title, setTitle] = useState('')
  const [markdown, setMarkdown] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !markdown.trim()) return
    await onImport(title, markdown)
    setTitle('')
    setMarkdown('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setMarkdown(text)

    if (!title) {
      setTitle(file.name.replace(/\.md$/, ''))
    }
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
              className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-2.5">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Import Markdown
                  </h2>
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
                {/* File Upload */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload .md file (optional)
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-green-500 hover:bg-green-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600 dark:hover:bg-green-900/20">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload Markdown file
                    </span>
                    <input
                      type="file"
                      accept=".md,.markdown,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Study Checklist"
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border-2 border-gray-200 px-4 outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Markdown Content */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Markdown Content
                  </label>
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="# My Checklist&#10;&#10;## Chapter 1&#10;- [ ] Topic 1&#10;- [ ] Topic 2&#10;&#10;**Bold** and *italic* supported!"
                    rows={12}
                    disabled={isLoading}
                    className="w-full rounded-xl border-2 border-gray-200 p-4 font-mono text-sm outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Supports: Headers (#, ##, ###), **bold**, *italic*, `code`, checkboxes (- [ ])
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !title.trim() || !markdown.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    Import Note
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