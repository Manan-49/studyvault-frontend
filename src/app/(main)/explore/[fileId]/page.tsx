// src/app/(main)/explore/[fileId]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  HardDrive,
  CheckCircle,
  Clock,
  XCircle,
  Folder,
  Copy,
  Check,
  Info,
  X,
  Menu,
  Image as ImageIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatBytes } from '@/lib/utils/format'
import { filesApi } from '@/lib/api/files'
import { apiClient } from '@/lib/api/client'

interface FileData {
  id: string
  title: string
  filename: string
  size_bytes: number
  created_at: string
  ocr_status: string
  mime_type: string
  folder_id?: string
  pages?: number
  ocr_text?: string
}

interface TouchPoint {
  x: number
  y: number
}

export default function FileViewPage() {
  const params = useParams()
  const router = useRouter()
  const fileId = params?.fileId as string

  const [file, setFile] = useState<FileData | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Viewer controls
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [showOCR, setShowOCR] = useState(false)
  const [copiedOCR, setCopiedOCR] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)

  // Pan and pinch-to-zoom
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<TouchPoint>({ x: 0, y: 0 })
  const [initialDistance, setInitialDistance] = useState(0)
  const [initialZoom, setInitialZoom] = useState(1)

  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch file data
  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true)
        const data = await filesApi.get(fileId)
        setFile(data)
        setTotalPages(data.pages || 1)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch file:', err)
        setError('Failed to load file')
      } finally {
        setLoading(false)
      }
    }

    if (fileId) fetchFile()
  }, [fileId])

  // Load file blob
  useEffect(() => {
    if (!file) return
    let currentUrl: string | null = null

    const loadFileBlob = async () => {
      try {
        const response = await apiClient.get(`/files/${file.id}/download`, {
          responseType: 'blob',
        })
        const blob = response.data
        currentUrl = URL.createObjectURL(blob)
        setFileUrl(currentUrl)
      } catch (error: any) {
        console.error('Error loading file blob:', error)
        setError('Failed to load file preview')
      }
    }

    loadFileBlob()

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl)
    }
  }, [file?.id])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const isImage = file?.mime_type.startsWith('image/')
      const isPDF = file?.mime_type === 'application/pdf'

      switch (e.key) {
        case '+':
        case '=':
          if (isImage) {
            e.preventDefault()
            handleZoomIn()
          }
          break
        case '-':
        case '_':
          if (isImage) {
            e.preventDefault()
            handleZoomOut()
          }
          break
        case 'r':
        case 'R':
          if (isImage) {
            e.preventDefault()
            handleRotate()
          }
          break
        case 'ArrowLeft':
          if (isPDF && currentPage > 1) {
            e.preventDefault()
            setCurrentPage(p => p - 1)
          }
          break
        case 'ArrowRight':
          if (isPDF && currentPage < totalPages) {
            e.preventDefault()
            setCurrentPage(p => p + 1)
          }
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault()
            document.exitFullscreen()
          }
          if (showInfo) {
            e.preventDefault()
            setShowInfo(false)
          }
          break
        case '0':
          if (isImage && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            handleResetView()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [file, currentPage, totalPages, isFullscreen, showInfo])

  // Touch handlers for pinch-to-zoom and pan
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const isImage = file?.mime_type.startsWith('image/')
    if (!isImage) return

    const getDistance = (touches: TouchList): number => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom start
        e.preventDefault()
        setInitialDistance(getDistance(e.touches))
        setInitialZoom(zoom)
      } else if (e.touches.length === 1 && zoom > 1) {
        // Pan start
        const touch = e.touches[0]
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
        setIsDragging(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        // Pinch zooming
        e.preventDefault()
        const currentDistance = getDistance(e.touches)
        const scale = currentDistance / initialDistance
        const newZoom = Math.min(Math.max(initialZoom * scale, 0.5), 3)
        setZoom(newZoom)
      } else if (e.touches.length === 1 && isDragging && zoom > 1) {
        // Panning
        e.preventDefault()
        const touch = e.touches[0]
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        })
      }
    }

    const handleTouchEnd = () => {
      setInitialDistance(0)
      setIsDragging(false)
    }

    // Mouse wheel zoom
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.min(Math.max(zoom * delta, 0.5), 3)
        setZoom(newZoom)
      }
    }

    // Mouse drag for desktop
    const handleMouseDown = (e: MouseEvent) => {
      if (zoom > 1) {
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
        setIsDragging(true)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [zoom, position, isDragging, dragStart, initialDistance, initialZoom, file])

  // Reset position when zoom resets
  useEffect(() => {
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }, [zoom])

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true)
      return
    }

    let timer: NodeJS.Timeout
    const handleInteraction = () => {
      setShowControls(true)
      clearTimeout(timer)
      timer = setTimeout(() => setShowControls(false), 3000)
    }

    window.addEventListener('mousemove', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)
    handleInteraction()

    return () => {
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      clearTimeout(timer)
    }
  }, [isFullscreen])

  // Reset on file change
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setCurrentPage(1)
  }, [file?.id])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleResetView = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleDownload = async () => {
    if (!file) return
    try {
      const blob = await filesApi.download(file.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share && file) {
        await navigator.share({
          title: file.title,
          text: `Check out: ${file.title}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  const handleCopyOCR = async () => {
    if (file?.ocr_text) {
      await navigator.clipboard.writeText(file.ocr_text)
      setCopiedOCR(true)
      setTimeout(() => setCopiedOCR(false), 2000)
    }
  }

  const handleDownloadOCR = () => {
    if (file?.ocr_text) {
      const blob = new Blob([file.ocr_text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.filename}_ocr.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getOCRStatus = () => {
    switch (file?.ocr_status) {
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Completed',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30',
        }
      case 'processing':
        return {
          icon: Clock,
          text: 'Processing',
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        }
      case 'failed':
        return {
          icon: XCircle,
          text: 'Failed',
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/30',
        }
      default:
        return {
          icon: Clock,
          text: 'Pending',
          color: 'text-muted-foreground',
          bg: 'bg-muted',
        }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-muted-foreground">Loading file...</p>
        </div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">File not found</h2>
          <p className="mb-6 text-muted-foreground">{error || 'This file does not exist'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isPDF = file.mime_type === 'application/pdf'
  const isImage = file.mime_type.startsWith('image/')
  const ocrStatus = getOCRStatus()
  const OCRIcon = ocrStatus.icon

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <AnimatePresence>
        {(!isFullscreen || showControls) && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className={`z-50 border-b-2 border-border bg-card/95 backdrop-blur-sm ${
              isFullscreen ? 'absolute left-0 right-0 top-0' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="flex-shrink-0 rounded-lg border-2 border-border p-2 hover:bg-accent"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-sm font-bold text-foreground sm:text-base">
                    {file.title}
                  </h1>
                  <p className="truncate text-xs text-muted-foreground">{file.filename}</p>
                </div>
              </div>

              <button
                onClick={() => setShowToolbar(!showToolbar)}
                className="flex-shrink-0 rounded-lg border-2 border-border p-2 hover:bg-accent lg:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden items-center gap-2 lg:flex">
                <button
                  onClick={() => setShowInfo(true)}
                  className="rounded-lg border-2 border-border p-2 hover:bg-accent"
                  title="Info"
                  aria-label="File info"
                >
                  <Info className="h-5 w-5" />
                </button>

                <button
                  onClick={handleDownload}
                  className="rounded-lg border-2 border-border p-2 hover:bg-accent"
                  title="Download"
                  aria-label="Download"
                >
                  <Download className="h-5 w-5" />
                </button>

                <button
                  onClick={handleShare}
                  className="rounded-lg border-2 border-border p-2 hover:bg-accent"
                  title="Share"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                  title="Fullscreen"
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Toolbar */}
            <AnimatePresence>
              {showToolbar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t-2 border-border lg:hidden"
                >
                  <div className="grid grid-cols-4 gap-2 p-3">
                    <button
                      onClick={() => {
                        setShowInfo(true)
                        setShowToolbar(false)
                      }}
                      className="flex flex-col items-center gap-1 rounded-lg border-2 border-border p-3 hover:bg-accent"
                    >
                      <Info className="h-5 w-5" />
                      <span className="text-xs">Info</span>
                    </button>

                    <button
                      onClick={() => {
                        handleDownload()
                        setShowToolbar(false)
                      }}
                      className="flex flex-col items-center gap-1 rounded-lg border-2 border-border p-3 hover:bg-accent"
                    >
                      <Download className="h-5 w-5" />
                      <span className="text-xs">Download</span>
                    </button>

                    <button
                      onClick={() => {
                        handleShare()
                        setShowToolbar(false)
                      }}
                      className="flex flex-col items-center gap-1 rounded-lg border-2 border-border p-3 hover:bg-accent"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="text-xs">Share</span>
                    </button>

                    <button
                      onClick={() => {
                        toggleFullscreen()
                        setShowToolbar(false)
                      }}
                      className="flex flex-col items-center gap-1 rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700"
                    >
                      {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                      <span className="text-xs">Fullscreen</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Viewer */}
      <div className="relative flex-1 overflow-hidden bg-muted">
        <div
          ref={containerRef}
          className="flex h-full items-center justify-center overflow-auto p-4"
          style={{ touchAction: 'none' }}
        >
          {!fileUrl ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-muted-foreground">Loading preview...</p>
            </div>
          ) : isPDF ? (
            <div className="w-full max-w-4xl">
              <iframe
                src={`${fileUrl}#page=${currentPage}&view=FitH`}
                className="h-[70vh] w-full rounded-lg border-2 border-border bg-white shadow-2xl sm:h-[80vh]"
                title={file.title}
              />
            </div>
          ) : isImage ? (
            <motion.img
              ref={imageRef}
              src={fileUrl}
              alt={file.title}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                userSelect: 'none',
              }}
              draggable={false}
            />
          ) : (
            <div className="max-w-md rounded-lg border-2 border-border bg-card p-8 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Download to View
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hint */}
        {isImage && !isFullscreen && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white sm:hidden">
            Pinch to zoom • Drag to pan
          </div>
        )}

        {/* Floating Controls */}
        <AnimatePresence>
          {(showControls || !isFullscreen) && (isPDF || isImage) && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-fit"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card/95 p-3 shadow-2xl backdrop-blur-sm">
                {/* Zoom Controls */}
                {isImage && (
                  <>
                    <div className="flex items-center gap-1 rounded-lg bg-muted">
                      <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.5}
                        className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                        title="Zoom Out"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="h-5 w-5" />
                      </button>
                      <span className="min-w-[3.5rem] text-center text-xs font-bold sm:text-sm">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}
                        className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                        title="Zoom In"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Rotate */}
                    <button
                      onClick={handleRotate}
                      className="rounded-lg bg-muted p-2 hover:bg-accent"
                      title="Rotate"
                      aria-label="Rotate image"
                    >
                      <RotateCw className="h-5 w-5" />
                    </button>

                    {/* Reset (visible when transformed) */}
                    {(zoom !== 1 || rotation !== 0 || position.x !== 0 || position.y !== 0) && (
                      <button
                        onClick={handleResetView}
                        className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold hover:bg-accent"
                        title="Reset view"
                        aria-label="Reset view"
                      >
                        Reset
                      </button>
                    )}
                  </>
                )}

                {/* PDF Page Navigation */}
                {isPDF && totalPages > 1 && (
                  <div className="flex items-center gap-1 rounded-lg bg-muted">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                      title="Previous"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="min-w-[4rem] text-center text-xs font-bold sm:text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                      title="Next"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OCR Text Section */}
      {!isFullscreen && file.ocr_status === 'completed' && file.ocr_text && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t-2 border-border bg-card"
        >
          <button
            onClick={() => setShowOCR(!showOCR)}
            className="flex w-full items-center justify-between p-4 hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-foreground sm:text-base">
                  Extracted Text (OCR)
                </h3>
                <p className="text-xs text-muted-foreground">{file.ocr_text.length} characters</p>
              </div>
            </div>
            <motion.div animate={{ rotate: showOCR ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft className="h-5 w-5 -rotate-90" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showOCR && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t-2 border-border p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button
                      onClick={handleCopyOCR}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      {copiedOCR ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadOCR}
                      className="flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-lg bg-muted p-4">
                    <p className="whitespace-pre-wrap text-sm">{file.ocr_text}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full overflow-y-auto border-l-2 border-border bg-card shadow-2xl sm:max-w-md"
            >
              <div className="sticky top-0 z-10 border-b-2 border-border bg-card/95 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">File Details</h2>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="rounded-lg p-2 hover:bg-accent"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-4">
                {/* Filename */}
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">File Name</p>
                    <p className="mt-1 break-all text-sm font-semibold">{file.filename}</p>
                  </div>
                </div>

                {/* Size */}
                <div className="flex items-start gap-3">
                  <HardDrive className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Size</p>
                    <p className="mt-1 text-sm font-semibold">{formatBytes(file.size_bytes)}</p>
                  </div>
                </div>

                {/* Created */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Uploaded</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Type</p>
                    <p className="mt-1 text-sm font-semibold">{file.mime_type}</p>
                  </div>
                </div>

                {/* Pages */}
                {file.pages && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Pages</p>
                      <p className="mt-1 text-sm font-semibold">{file.pages}</p>
                    </div>
                  </div>
                )}

                {/* OCR Status */}
                <div className="flex items-start gap-3">
                  <OCRIcon className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">OCR Status</p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ocrStatus.bg} ${ocrStatus.color}`}
                    >
                      <OCRIcon className="h-3.5 w-3.5" />
                      {ocrStatus.text}
                    </span>
                  </div>
                </div>

                {/* Folder */}
                {file.folder_id && (
                  <div className="flex items-start gap-3">
                    <Folder className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Folder</p>
                      <button
                        onClick={() => router.push(`/explore?folder_id=${file.folder_id}`)}
                        className="mt-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Go to folder →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Keyboard Shortcuts (Desktop) */}
              <div className="m-4 rounded-lg border-2 border-border bg-muted p-4 hidden sm:block">
                <h3 className="mb-3 text-sm font-bold">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {isImage && (
                    <>
                      <div className="flex justify-between">
                        <span>Zoom In/Out</span>
                        <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">
                          + -
                        </kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Rotate</span>
                        <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">R</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Reset View</span>
                        <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">
                          Ctrl+0
                        </kbd>
                      </div>
                    </>
                  )}
                  {isPDF && totalPages > 1 && (
                    <div className="flex justify-between">
                      <span>Next/Previous</span>
                      <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">
                        ← →
                      </kbd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Fullscreen</span>
                    <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">F</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Close Panel</span>
                    <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">Esc</kbd>
                  </div>
                </div>
              </div>

              {/* Touch Gestures (Mobile) */}
              <div className="m-4 rounded-lg border-2 border-border bg-muted p-4 sm:hidden">
                <h3 className="mb-3 text-sm font-bold">Touch Gestures</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {isImage && (
                    <>
                      <div className="flex justify-between">
                        <span>Zoom</span>
                        <span className="font-semibold">Pinch</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pan</span>
                        <span className="font-semibold">Drag</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Scroll</span>
                    <span className="font-semibold">Swipe</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Link copied to clipboard!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}