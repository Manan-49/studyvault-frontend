// src/app/(main)/explore/[fileId]/page.tsx

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Share2,
  Maximize,
  Minimize,
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

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

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
  const [offset, setOffset] = useState({ x: 0, y: 0 }) // panning
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [showOCR, setShowOCR] = useState(false)
  const [copiedOCR, setCopiedOCR] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Gesture refs for pinch/pan
  const gestureRef = useRef<HTMLDivElement | null>(null)
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStartDistRef = useRef<number | null>(null)
  const pinchStartZoomRef = useRef<number>(1)
  const panPointerIdRef = useRef<number | null>(null)
  const lastPanRef = useRef<{ x: number; y: number } | null>(null)

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

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage((p) => p - 1)
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage((p) => p + 1)
      } else if (e.key === 'f' || e.key === 'F11') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen()
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn()
      } else if (e.key === '-') {
        handleZoomOut()
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotate()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, totalPages, isFullscreen])

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true)
      return
    }

    let timer: any
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timer)
      timer = setTimeout(() => setShowControls(false), 3000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timer)
    }
  }, [isFullscreen])

  // Reset transform when file or page changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
    setCurrentPage(1)
  }, [file?.id])

  // Keep offset reset when zoom returns to 1
  useEffect(() => {
    if (zoom <= 1.0001) {
      setOffset({ x: 0, y: 0 })
    }
  }, [zoom])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleZoomIn = () => setZoom((z) => clamp(z + 0.25, 0.5, 3))
  const handleZoomOut = () => setZoom((z) => clamp(z - 0.25, 0.5, 3))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const openInNewTab = () => {
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer')
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

  const handleGoToFolder = () => {
    if (file?.folder_id) {
      router.push(`/explore?folder_id=${file.folder_id}`)
    } else {
      router.push('/explore')
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

  // Pinch and Pan handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values())
      pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      pinchStartZoomRef.current = zoom
    } else if (pointersRef.current.size === 1 && zoom > 1) {
      panPointerIdRef.current = e.pointerId
      lastPanRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // Pinch
    if (pointersRef.current.size >= 2 && pinchStartDistRef.current) {
      const pts = Array.from(pointersRef.current.values())
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const scaleFactor = dist / pinchStartDistRef.current
      setZoom(clamp(pinchStartZoomRef.current * scaleFactor, 0.5, 3))
      e.preventDefault()
      return
    }

    // Pan
    if (panPointerIdRef.current === e.pointerId && zoom > 1 && lastPanRef.current) {
      const dx = e.clientX - lastPanRef.current.x
      const dy = e.clientY - lastPanRef.current.y
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }))
      lastPanRef.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }
  }

  const onPointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId)
    if (panPointerIdRef.current === e.pointerId) {
      panPointerIdRef.current = null
      lastPanRef.current = null
    }
    if (pointersRef.current.size < 2) {
      pinchStartDistRef.current = null
      pinchStartZoomRef.current = zoom
    }
  }

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // pinch-to-zoom on trackpads sends ctrl + wheel
    if (e.ctrlKey) {
      e.preventDefault()
      setZoom((z) => clamp(z * (e.deltaY < 0 ? 1.1 : 0.9), 0.5, 3))
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-muted-foreground">Loading file...</p>
        </div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">File not found</h2>
          <p className="mb-6 text-muted-foreground">{error || 'This file does not exist'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </motion.button>
        </div>
      </div>
    )
  }

  const isPDF = file.mime_type === 'application/pdf'
  const isImage = file.mime_type.startsWith('image/')
  const ocrStatus = getOCRStatus()
  const OCRIcon = ocrStatus.icon

  return (
    <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'min-h-[calc(100vh-4rem)] pb-4'}`}>
      {/* Header */}
      <AnimatePresence>
        {(!isFullscreen || showControls) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
              isFullscreen ? 'fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 p-4 backdrop-blur-sm' : ''
            }`}
          >
            {/* Title */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="flex-shrink-0 rounded-xl border-2 border-border bg-card p-2 hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">{file.title}</h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{file.filename}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInfo(true)}
                className="rounded-xl border-2 border-border bg-card p-2 hover:bg-accent"
                title="Info"
              >
                <Info className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="rounded-xl border-2 border-border bg-card p-2 hover:bg-accent"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="rounded-xl border-2 border-border bg-card p-2 hover:bg-accent"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewer */}
      <div className="relative flex-1 overflow-hidden rounded-xl bg-muted">
        {/* File Content */}
        <div className="flex h-full items-center justify-center overflow-auto p-4">
          {!fileUrl ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-muted-foreground">Loading preview...</p>
            </div>
          ) : (
            <motion.div
              ref={gestureRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUpOrCancel}
              onPointerCancel={onPointerUpOrCancel}
              onWheel={onWheel}
              className="relative inline-block"
              animate={{
                scale: zoom,
                rotate: rotation,
                x: offset.x,
                y: offset.y,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              style={{
                touchAction: 'none', // enables custom pinch/pan
                transformOrigin: 'center center',
                cursor: zoom > 1 ? 'grab' : 'default',
              }}
            >
              {isPDF ? (
                <>
                  {/* Prefer object/embed for better mobile support; fallback link */}
                  <object
                    data={`${fileUrl}#page=${currentPage}`}
                    type="application/pdf"
                    className="rounded-lg shadow-2xl"
                    style={{
                      width: '100%',
                      maxWidth: '900px',
                      height: isFullscreen ? '85vh' : '70vh',
                      border: 'none',
                    }}
                  >
                    <div className="max-w-md rounded-xl border-2 border-border bg-card p-6 text-center">
                      <p className="mb-4 text-sm text-muted-foreground">
                        PDF preview is not supported on this device.
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <button
                          onClick={openInNewTab}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Open in new tab
                        </button>
                        <button
                          onClick={handleDownload}
                          className="rounded-lg border-2 border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </object>
                </>
              ) : isImage ? (
                <img
                  src={fileUrl}
                  alt={file.title}
                  className="rounded-lg shadow-2xl"
                  style={{
                    maxWidth: '100%',
                    maxHeight: isFullscreen ? '85vh' : '70vh',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  draggable={false}
                />
              ) : (
                <div className="max-w-md rounded-xl border-2 border-border bg-card p-8 text-center">
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
            </motion.div>
          )}
        </div>

        {/* Floating Controls - mobile-safe placement */}
        <AnimatePresence>
          {(showControls || !isFullscreen) && (isPDF || isImage) && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed z-40 left-4 right-4 bottom-[calc(env(safe-area-inset-bottom)+16px)] sm:left-1/2 sm:right-auto sm:bottom-6 sm:-translate-x-1/2 flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card/95 p-3 shadow-2xl backdrop-blur-sm"
            >
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 rounded-xl bg-muted px-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="min-w-[3.5rem] text-center text-sm font-bold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>

              {/* Rotate */}
              <button
                onClick={handleRotate}
                className="rounded-xl bg-muted p-2 hover:bg-accent"
                title="Rotate"
              >
                <RotateCw className="h-5 w-5" />
              </button>

              {/* PDF Page Navigation */}
              {isPDF && totalPages > 1 && (
                <>
                  <div className="hidden h-8 w-px bg-border sm:block" />
                  <div className="flex items-center gap-1 rounded-xl bg-muted px-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                      title="Previous"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="min-w-[4rem] text-center text-sm font-bold">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg p-2 hover:bg-accent disabled:opacity-50"
                      title="Next"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OCR Text Section */}
      {!isFullscreen && file.ocr_status === 'completed' && file.ocr_text && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 overflow-hidden rounded-xl border-2 border-border bg-card"
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
                <h3 className="font-bold text-foreground">Extracted Text (OCR)</h3>
                <p className="text-xs text-muted-foreground">{file.ocr_text.length} characters</p>
              </div>
            </div>
            <motion.div animate={{ rotate: showOCR ? 180 : 0 }}>
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
              >
                <div className="border-t-2 border-border p-4">
                  <div className="mb-3 flex gap-2">
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
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-y-auto border-l-2 border-border bg-card p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">File Details</h2>
                <button onClick={() => setShowInfo(false)} className="rounded-lg p-2 hover:bg-accent">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Filename */}
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">File Name</p>
                    <p className="mt-1 break-all text-sm font-semibold">{file.filename}</p>
                  </div>
                </div>

                {/* Size */}
                <div className="flex items-start gap-3">
                  <HardDrive className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Size</p>
                    <p className="mt-1 text-sm font-semibold">{formatBytes(file.size_bytes)}</p>
                  </div>
                </div>

                {/* Created */}
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Uploaded</p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Type */}
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Type</p>
                    <p className="mt-1 text-sm font-semibold">{file.mime_type}</p>
                  </div>
                </div>

                {/* Pages */}
                {file.pages && (
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Pages</p>
                      <p className="mt-1 text-sm font-semibold">{file.pages}</p>
                    </div>
                  </div>
                )}

                {/* OCR Status */}
                <div className="flex items-start gap-3">
                  <OCRIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
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
                    <Folder className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Folder</p>
                      <button
                        onClick={handleGoToFolder}
                        className="mt-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Go to folder →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-8 rounded-xl border-2 border-border bg-muted p-4">
                <h3 className="mb-3 text-sm font-bold">Keyboard Shortcuts</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Zoom In/Out</span>
                    <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">+ -</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotate</span>
                    <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">R</kbd>
                  </div>
                  {isPDF && totalPages > 1 && (
                    <div className="flex justify-between">
                      <span>Next/Previous</span>
                      <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">← →</kbd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Fullscreen</span>
                    <kbd className="rounded bg-background px-2 py-1 font-mono font-semibold">F</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Link Copied Toast */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+24px)] right-6 z-50 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-2xl"
          >
            <Check className="h-5 w-5" />
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}