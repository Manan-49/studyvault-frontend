'use client'

import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion } from 'framer-motion'
import { useGesture } from 'react-use-gesture'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize, 
  Loader2, 
  AlertCircle,
  Download,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react'
import { ReadingProgress } from './reading-progress'
import { PageBookmarks } from './page-bookmarks'
import { PageJump } from './page-jump'

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
}

interface PDFViewerProps {
  url: string
  fileName: string
  fileId: string
}

export function PDFViewerEnhanced({ url, fileName, fileId }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readingMode, setReadingMode] = useState(false)

  // Load last read position
  useEffect(() => {
    const saved = localStorage.getItem(`reading-progress-${fileId}`)
    if (saved) {
      const data = JSON.parse(saved)
      if (data.currentPage) {
        setPageNumber(data.currentPage)
      }
    }
  }, [fileId])

  // Touch gestures
  const bind = useGesture({
    onPinch: ({ offset: [pinchScale] }) => {
      setScale(Math.max(0.5, Math.min(3, pinchScale)))
    },
  })

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error)
    setError('Failed to load PDF')
    setLoading(false)
  }

  const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1))
  const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1))
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleFullScreen = () => window.open(url, '_blank')

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar - Learning Tools */}
      {!readingMode && (
        <div className="hidden w-64 flex-shrink-0 space-y-4 overflow-y-auto rounded-lg border border-border bg-card p-4 lg:block">
          {numPages && (
            <>
              <ReadingProgress
                fileId={fileId}
                currentPage={pageNumber}
                totalPages={numPages}
                onJumpToPage={setPageNumber}
              />
              
              <div className="border-t border-border pt-4">
                <PageJump
                  currentPage={pageNumber}
                  totalPages={numPages}
                  onJumpToPage={setPageNumber}
                />
              </div>

              <div className="border-t border-border pt-4">
                <PageBookmarks
                  fileId={fileId}
                  currentPage={pageNumber}
                  onJumpToPage={setPageNumber}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Viewer */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/80 p-2 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="rounded-lg bg-muted p-2 hover:bg-accent disabled:opacity-50"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3.5rem] text-center text-sm font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="rounded-lg bg-muted p-2 hover:bg-accent disabled:opacity-50"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {numPages && numPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevPage}
                disabled={pageNumber === 1}
                className="rounded-lg bg-muted p-2 hover:bg-accent disabled:opacity-50"
                title="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[5rem] text-center text-sm font-medium">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNumber === numPages}
                className="rounded-lg bg-muted p-2 hover:bg-accent disabled:opacity-50"
                title="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleRotate}
              className="rounded-lg bg-muted p-2 hover:bg-accent"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setReadingMode(!readingMode)}
              className="rounded-lg bg-muted p-2 hover:bg-accent lg:block hidden"
              title="Reading Mode"
            >
              {readingMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={handleFullScreen}
              className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="relative flex-1 overflow-auto bg-muted" {...bind()}>
          {loading && !error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                <p className="mt-2 text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-md text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">Failed to load PDF</h3>
                <p className="mb-4 text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={handleFullScreen}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-4">
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                options={{
                  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                }}
              >
                <motion.div
                  animate={{ scale, rotate: rotation }}
                  transition={{ duration: 0.3 }}
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="overflow-hidden rounded-lg shadow-2xl"
                  />
                </motion.div>
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}