// src/app/(main)/explore/[fileId]/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
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

  // Touch gesture handling
  const viewerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; distance: number }>({ x: 0, y: 0, distance: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

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

    const loadFileBlob = async () => {
      try {
        const response = await apiClient.get(`/files/${file.id}/download`, {
          responseType: 'blob',
        })
        const blob = response.data
        const url = URL.createObjectURL(blob)
        setFileUrl(url)
      } catch (error: any) {
        console.error('Error loading file blob:', error)
        setError('Failed to load file preview')
      }
    }

    loadFileBlob()

    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [file?.id])

  // Touch gestures for pinch zoom and pan
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        touchStartRef.current.distance = getTouchDistance(e.touches)
      } else if (e.touches.length === 1 && zoom > 1) {
        touchStartRef.current.x = e.touches[0].clientX - panOffset.x
        touchStartRef.current.y = e.touches[0].clientY - panOffset.y
        setIsPanning(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const currentDistance = getTouchDistance(e.touches)
        const scale = currentDistance / touchStartRef.current.distance
        const newZoom = Math.min(Math.max(zoom * scale, 0.5), 3)
        setZoom(newZoom)
        touchStartRef.current.distance = currentDistance
      } else if (e.touches.length === 1 && isPanning && zoom > 1) {
        e.preventDefault()
        const newX = e.touches[0].clientX - touchStartRef.current.x
        const newY = e.touches[0].clientY - touchStartRef.current.y
        setPanOffset({ x: newX, y: newY })
      }
    }

    const handleTouchEnd = () => {
      setIsPanning(false)
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        const newZoom = Math.min(Math.max(zoom * delta, 0.5), 3)
        setZoom(newZoom)
      }
    }

    viewer.addEventListener('touchstart', handleTouchStart, { passive: false })
    viewer.addEventListener('touchmove', handleTouchMove, { passive: false })
    viewer.addEventListener('touchend', handleTouchEnd)
    viewer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      viewer.removeEventListener('touchstart', handleTouchStart)
      viewer.removeEventListener('touchmove', handleTouchMove)
      viewer.removeEventListener('touchend', handleTouchEnd)
      viewer.removeEventListener('wheel', handleWheel)
    }
  }, [zoom, panOffset, isPanning])

  // Reset pan when zoom is reset
  useEffect(() => {
    if (zoom <= 1) {
      setPanOffset({ x: 0, y: 0 })
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

    let timer: NodeJS.Timeout
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)
  const handleResetView = () => {
    setZoom(1)
    setRotation(0)
    setPanOffset({ x: 0, y: 0 })
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
            className={`mb-4 flex flex-col gap-3 px-4 sm:px-0 sm:flex-row sm:items-center sm:justify-between ${
              isFullscreen ? 'fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 p-4 backdrop-blur-sm' : ''
            }`}
          >
            {/* Title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
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
      <div 
        ref={viewerRef}
        className="relative flex-1 overflow-hidden rounded-xl bg-muted mx-4 sm:mx-0 touch-none"
        style={{ touchAction: 'none' }}
      >
        {/* File Content */}
        <div className="flex h-full items-center justify-center overflow-hidden p-4">
          {!fileUrl ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-muted-foreground">Loading preview...</p>
            </div>
          ) : isPDF ? (
            <div
              className="relative"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.2s',
                width: '100%',
                maxWidth: '900px',
                height: isFullscreen ? '90vh' : '75vh',
              }}
            >
              <iframe
                src={`${fileUrl}#page=${currentPage}&view=FitH`}
                className="rounded-lg shadow-2xl pointer-events-auto"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
              <div className="absolute inset-0 pointer-events-none" />
            </div>
          ) : isImage ? (
            <motion.img
              src={fileUrl}
              alt={file.title}
              className="rounded-lg shadow-2xl select-none"
              draggable={false}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.2s',
                maxWidth: '100%',
                maxHeight: isFullscreen ? '90vh' : '75vh',
                objectFit: 'contain',
                touchAction: 'none',
              }}
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
        </div>

        {/* Mobile Hint */}
        {(isPDF || isImage) && !isFullscreen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white sm:hidden">
            Pinch to zoom • Tap controls below
          </div>
        )}

        {/* Floating Controls */}
        <AnimatePresence>
          {(showControls || !isFullscreen) && (isPDF || isImage) && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border-2 border-border bg-card/95 p-2 shadow-2xl backdrop-blur-sm max-w-[calc(100vw-2rem)] overflow-x-auto"
              style={{ touchAction: 'auto' }}
            >
              {/* Zoom Controls */}
              <div className="flex items-center rounded-xl bg-muted">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="rounded-l-lg p-2 hover:bg-accent disabled:opacity-50"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <span className="min-w-[3rem] text-center text-xs sm:text-sm font-bold px-1">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="rounded-r-lg p-2 hover:bg-accent disabled:opacity-50"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Rotate */}
              <button
                onClick={handleRotate}
                className="rounded-xl bg-muted p-2 hover:bg-accent"
                title="Rotate"
              >
                <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Reset (mobile only) */}
              {(zoom !== 1 || rotation !== 0) && (
                <button
                  onClick={handleResetView}
                  className="rounded-xl bg-muted px-3 py-2 text-xs font-semibold hover:bg-accent sm:hidden"
                >
                  Reset
                </button>
              )}

              {/* PDF Page Navigation */}
              {isPDF && totalPages > 1 && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex items-center rounded-xl bg-muted">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-l-lg p-2 hover:bg-accent disabled:opacity-50"
                      title="Previous"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <span className="min-w-[3.5rem] text-center text-xs sm:text-sm font-bold px-1">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-r-lg p-2 hover:bg-accent disabled:opacity-50"
                      title="Next"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
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
          className="mt-4 mx-4 sm:mx-0 overflow-hidden rounded-xl border-2 border-border bg-card"
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

              {/* Keyboard Shortcuts - Desktop Only */}
              <div className="mt-8 rounded-xl border-2 border-border bg-muted p-4 hidden sm:block">
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

              {/* Mobile Gestures */}
              <div className="mt-8 rounded-xl border-2 border-border bg-muted p-4 sm:hidden">
                <h3 className="mb-3 text-sm font-bold">Touch Gestures</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Zoom</span>
                    <span className="font-semibold">Pinch</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pan (when zoomed)</span>
                    <span className="font-semibold">Drag</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotate</span>
                    <span className="font-semibold">Tap button</span>
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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white shadow-2xl"
          >
            <Check className="h-5 w-5" />
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}