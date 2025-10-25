'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCw, Maximize, Loader2 } from 'lucide-react'

interface ImageViewerProps {
  url: string
  alt: string
}

export function ImageViewerEnhanced({ url, alt }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleFullScreen = () => window.open(url, '_blank')

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white/80 p-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
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

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRotate}
            className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <RotateCw className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFullScreen}
            className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
          >
            <Maximize className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Image Display */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-b-2xl bg-gray-100 dark:bg-gray-900">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        <motion.img
          src={url}
          alt={alt}
          onLoad={() => setLoading(false)}
          animate={{ scale: zoom / 100, rotate: rotation }}
          transition={{ duration: 0.3 }}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    </div>
  )
}