'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Loader2, AlertCircle } from 'lucide-react'

interface PDFViewerProps {
  url: string
  fileName: string
  totalPages?: number
}

export function PDFViewerEnhanced({ url, fileName, totalPages }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  
  const handleFullScreen = () => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleIframeLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleIframeError = () => {
    setLoading(false)
    setError(true)
  }

  // Build iframe src with page and zoom parameters
  const iframeSrc = `${url}#page=${currentPage}&zoom=${zoom}`

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-border bg-card/80 p-3 backdrop-blur-sm">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="rounded-lg bg-muted p-2 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </motion.button>
          <span className="min-w-[4rem] text-center text-sm font-medium text-muted-foreground">
            {zoom}%
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="rounded-lg bg-muted p-2 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
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
              className="rounded-lg bg-muted p-2 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {isMobile ? `${currentPage}/${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-muted p-2 transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
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
          aria-label="Open in new tab"
        >
          <Maximize className="h-4 w-4" />
        </motion.button>
      </div>

      {/* PDF Iframe */}
      <div className="relative flex-1 overflow-hidden rounded-b-2xl bg-muted">
        {loading && !error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <div className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Failed to load PDF
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                The PDF preview could not be loaded. Try downloading the file instead.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFullScreen}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Open in New Tab
              </motion.button>
            </div>
          </div>
        ) : (
          <iframe
            src={iframeSrc}
            title={fileName}
            className="h-full w-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </div>
    </div>
  )
}