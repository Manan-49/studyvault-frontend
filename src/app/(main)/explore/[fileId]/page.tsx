'use client'

import { useState, useEffect } from 'react'
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
  ChevronDown,
  ChevronUp,
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
  const [copiedOCR, setCopiedOCR] = useState(false)
  const [showOCR, setShowOCR] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

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
        alert('Link copied to clipboard!')
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
          text: 'OCR Completed',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/30',
        }
      case 'processing':
        return {
          icon: Clock,
          text: 'Processing...',
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        }
      case 'failed':
        return {
          icon: XCircle,
          text: 'OCR Failed',
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
    <div className={`flex flex-col gap-4 ${isFullscreen ? 'h-screen p-0' : 'min-h-[calc(100vh-4rem)] pb-4'}`}>
      {/* Header */}
      <AnimatePresence>
        {(!isFullscreen || showControls) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${
              isFullscreen ? 'fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 p-4 backdrop-blur-sm' : ''
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-2 font-medium text-muted-foreground hover:bg-accent sm:px-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-foreground sm:text-2xl">{file.title}</h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{file.filename}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent sm:gap-2 sm:px-4"
                title="Download"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Download</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent sm:gap-2 sm:px-4"
                title="Share"
              >
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Share</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:gap-2 sm:px-4"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        {/* Viewer */}
        <div className="relative flex-1 overflow-hidden rounded-lg bg-muted">
          {/* PDF/Image Viewer Controls */}
          <AnimatePresence>
            {(showControls || !isFullscreen) && (isPDF || isImage) && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm sm:gap-2"
              >
                {/* Zoom Out */}
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="rounded-lg p-1.5 hover:bg-accent disabled:opacity-50 sm:p-2"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                {/* Zoom Level */}
                <span className="min-w-[2.5rem] text-center text-xs font-medium sm:min-w-[3rem] sm:text-sm">
                  {Math.round(zoom * 100)}%
                </span>

                {/* Zoom In */}
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="rounded-lg p-1.5 hover:bg-accent disabled:opacity-50 sm:p-2"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                <div className="h-5 w-px bg-border sm:h-6" />

                {/* Rotate */}
                <button
                  onClick={handleRotate}
                  className="rounded-lg p-1.5 hover:bg-accent sm:p-2"
                  title="Rotate (R)"
                >
                  <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                {isPDF && totalPages > 1 && (
                  <>
                    <div className="h-5 w-px bg-border sm:h-6" />

                    {/* Previous Page */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg p-1.5 hover:bg-accent disabled:opacity-50 sm:p-2"
                      title="Previous (←)"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>

                    {/* Page Number */}
                    <span className="min-w-[3.5rem] text-center text-xs font-medium sm:min-w-[5rem] sm:text-sm">
                      {currentPage} / {totalPages}
                    </span>

                    {/* Next Page */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg p-1.5 hover:bg-accent disabled:opacity-50 sm:p-2"
                      title="Next (→)"
                    >
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Content */}
          <div className="flex min-h-full items-center justify-center overflow-auto p-2 sm:p-4">
            {!fileUrl ? (
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600 sm:h-12 sm:w-12" />
                <p className="mt-4 text-xs text-muted-foreground sm:text-sm">Loading preview...</p>
              </div>
            ) : isPDF ? (
              <motion.iframe
                key={currentPage}
                src={`${fileUrl}#page=${currentPage}`}
                className="rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: zoom,
                  rotate: rotation,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: '100%',
                  maxWidth: '900px',
                  height: '70vh',
                  border: 'none',
                }}
              />
            ) : isImage ? (
              <motion.img
                src={fileUrl}
                alt={file.title}
                className="rounded-lg shadow-2xl"
                animate={{
                  scale: zoom,
                  rotate: rotation,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  maxWidth: '100%',
                  maxHeight: '85vh',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                <p className="mb-4 text-sm text-muted-foreground sm:text-base">
                  Preview not available for this file type
                </p>
                <button
                  onClick={handleDownload}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:px-6 sm:text-base"
                >
                  Download to View
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Desktop Only */}
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden w-80 flex-shrink-0 space-y-4 overflow-y-auto lg:block"
          >
            {/* File Details Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-foreground">File Details</h2>
              <div className="space-y-4">
                {/* Size */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="flex items-start gap-3"
                >
                  <HardDrive className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Size</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatBytes(file.size_bytes)}</p>
                  </div>
                </motion.div>

                {/* Uploaded */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-start gap-3"
                >
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Uploaded</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>

                {/* Type */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-3"
                >
                  <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Type</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{file.mime_type}</p>
                  </div>
                </motion.div>

                {/* Pages */}
                {file.pages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-start gap-3"
                  >
                    <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Pages</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{file.pages}</p>
                    </div>
                  </motion.div>
                )}

                {/* OCR Status */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <OCRIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">OCR Status</p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${ocrStatus.bg} ${ocrStatus.color}`}
                    >
                      <OCRIcon className="h-3.5 w-3.5" />
                      {ocrStatus.text}
                    </span>
                  </div>
                </motion.div>

                {/* Folder */}
                {file.folder_id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-start gap-3"
                  >
                    <Folder className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Folder</p>
                      <button
                        onClick={handleGoToFolder}
                        className="mt-1 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Go to folder →
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-foreground">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Next/Previous</span>
                  <kbd className="rounded bg-muted px-2 py-1 font-mono">← →</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Zoom In/Out</span>
                  <kbd className="rounded bg-muted px-2 py-1 font-mono">+ -</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Rotate</span>
                  <kbd className="rounded bg-muted px-2 py-1 font-mono">R</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Fullscreen</span>
                  <kbd className="rounded bg-muted px-2 py-1 font-mono">F</kbd>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* OCR Text Section - Mobile Accordion */}
      {!isFullscreen && file.ocr_status === 'completed' && file.ocr_text && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header - Collapsible on Mobile */}
          <button
            onClick={() => setShowOCR(!showOCR)}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent sm:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-foreground sm:text-lg">Extracted Text (OCR)</h2>
                <p className="text-xs text-muted-foreground">
                  {file.ocr_text.length} characters • Click to {showOCR ? 'collapse' : 'expand'}
                </p>
              </div>
            </div>
            {showOCR ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {/* Content */}
          <AnimatePresence>
            {showOCR && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="border-t border-border">
                  <div className="flex flex-wrap gap-2 border-b border-border p-3 sm:p-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyOCR}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:px-4"
                    >
                      {copiedOCR ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Text
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadOCR}
                      className="flex items-center gap-2 rounded-lg border-2 border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent sm:px-4"
                    >
                      <Download className="h-4 w-4" />
                      Download TXT
                    </motion.button>
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-b-2xl bg-muted p-4 sm:max-h-96">
                    <p className="whitespace-pre-wrap text-xs text-foreground sm:text-sm">{file.ocr_text}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Mobile Sidebar - Bottom Sheet */}
      {!isFullscreen && (
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSidebar(false)}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              />

              {/* Sidebar */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl lg:hidden"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">File Details</h2>
                  <button onClick={() => setShowSidebar(false)} className="rounded-lg p-2 hover:bg-accent">
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Size */}
                  <div className="flex items-start gap-3">
                    <HardDrive className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Size</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{formatBytes(file.size_bytes)}</p>
                    </div>
                  </div>

                  {/* Uploaded */}
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Uploaded</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">Type</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{file.mime_type}</p>
                    </div>
                  </div>

                  {/* Pages */}
                  {file.pages && (
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Pages</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{file.pages}</p>
                      </div>
                    </div>
                  )}

                  {/* OCR Status */}
                  <div className="flex items-start gap-3">
                    <OCRIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground">OCR Status</p>
                      <span
                        className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${ocrStatus.bg} ${ocrStatus.color}`}
                      >
                        <OCRIcon className="h-3.5 w-3.5" />
                        {ocrStatus.text}
                      </span>
                    </div>
                  </div>

                  {/* Folder */}
                  {file.folder_id && (
                    <div className="flex items-start gap-3">
                      <Folder className="mt-0.5 h-5 w-5 text-muted-foreground" />
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
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}