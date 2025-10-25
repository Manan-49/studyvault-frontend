'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Copy, Download, Check } from 'lucide-react'

interface OCRTextViewerProps {
  text: string
  fileName: string
}

export function OCRTextViewer({ text, fileName }: OCRTextViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}_ocr.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">Extracted Text (OCR)</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {text.length} characters • Click to {isExpanded ? 'collapse' : 'expand'}
            </p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-gray-200 dark:border-gray-800">
              {/* Actions */}
              <div className="flex gap-2 border-b border-gray-200 p-3 dark:border-gray-800">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  Download
                </motion.button>
              </div>

              {/* Text */}
              <div className="max-h-96 overflow-y-auto p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {text}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}