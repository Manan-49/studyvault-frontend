'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Loader2 } from 'lucide-react'

interface PDFViewerProps {
  url: string
  fileName: string
  totalPages?: number
}

export function PDFViewerEnhanced({ url, fileName, totalPages }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(true)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleFullScreen = () => {
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-gray-200 bg-white/80 p-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomOut}
            className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <ZoomOut className="h-4 w-4" />
          </motion.button>
          <span className="min-w-[4rem] text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {zoom}%
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomIn}
            className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <ZoomIn className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Page Navigation */}
        {totalPages && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        )}

        {/* Full Screen */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFullScreen}
          className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
        >
          <Maximize className="h-4 w-4" />
        </motion.button>
      </div>

      {/* PDF Iframe */}
      <div className="relative flex-1 overflow-hidden rounded-b-2xl bg-gray-100 dark:bg-gray-800">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        <iframe
          src={`${url}#page=${currentPage}&zoom=${zoom}`}
          title={fileName}
          className="h-full w-full border-0"
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  )
}