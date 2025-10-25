'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  HardDrive,
  Folder,
  FileType,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatBytes } from '@/lib/utils/format'
import { filesApi } from '@/lib/api/files'
import { storage } from '@/lib/utils/storage'
import { FileBreadcrumb } from '@/components/file-viewer/file-breadcrumb'
import { PDFViewerEnhanced } from '@/components/file-viewer/pdf-viewer-enhanced'
import { ImageViewerEnhanced } from '@/components/file-viewer/image-viewer-enhanced'
import { FileInfoCard } from '@/components/file-viewer/file-info-card'
import { FileActionsBar } from '@/components/file-viewer/file-actions-bar'
import { OCRTextViewer } from '@/components/file-viewer/ocr-text-viewer'
import { LoadingFileViewer } from '@/components/file-viewer/loading-file-viewer'

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

  // Fetch file data
  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true)
        const data = await filesApi.get(fileId)
        setFile(data)
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

  // Load file blob for preview
  useEffect(() => {
    if (!file) return

    const loadFileBlob = async () => {
      try {
        const token = storage.getAccessToken()
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/download`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!response.ok) throw new Error('Failed to load file')

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setFileUrl(url)
      } catch (error) {
        console.error('Error loading file blob:', error)
      }
    }

    loadFileBlob()

    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [file])

  // Handlers
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

  const handlePrint = () => {
    if (fileUrl) {
      const printWindow = window.open(fileUrl, '_blank')
      printWindow?.print()
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: file?.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleGoToFolder = () => {
    if (file?.folder_id) {
      router.push(`/explore?folder_id=${file.folder_id}`)
    } else {
      router.push('/explore')
    }
  }

  // Loading state
  if (loading) {
    return <LoadingFileViewer />
  }

  // Error state
  if (error || !file) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[600px] flex-col items-center justify-center"
      >
        <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/30">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">File not found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error || 'This file does not exist'}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <ArrowLeft className="h-5 w-5" />
          Go Back
        </motion.button>
      </motion.div>
    )
  }

  const isPDF = file.mime_type === 'application/pdf'
  const isImage = file.mime_type.startsWith('image/')

  const getOCRStatus = () => {
    switch (file.ocr_status) {
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
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-800',
        }
    }
  }

  const ocrStatus = getOCRStatus()
  const OCRIcon = ocrStatus.icon

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </motion.button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {file.title}
            </h1>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{file.filename}</p>
          </div>
        </div>
      </motion.div>

      {/* Breadcrumb */}
      <FileBreadcrumb fileName={file.title} folderId={file.folder_id} />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="aspect-[4/3] md:aspect-auto md:h-[600px]">
              {isPDF && fileUrl ? (
                <PDFViewerEnhanced
                  url={fileUrl}
                  fileName={file.filename}
                  totalPages={file.pages}
                />
              ) : isImage && fileUrl ? (
                <ImageViewerEnhanced url={fileUrl} alt={file.title} />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <FileType className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      Preview not available
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownload}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Download to View
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* File Details */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">File Details</h2>
            <div className="space-y-4">
              <FileInfoCard
                icon={HardDrive}
                label="Size"
                value={formatBytes(file.size_bytes)}
                delay={0.3}
              />
              <FileInfoCard
                icon={Calendar}
                label="Uploaded"
                value={formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                delay={0.35}
              />
              <FileInfoCard
                icon={FileType}
                label="Type"
                value={file.mime_type}
                delay={0.4}
              />
              {file.pages && (
                <FileInfoCard
                  icon={FileType}
                  label="Pages"
                  value={file.pages.toString()}
                  delay={0.45}
                />
              )}
              <FileInfoCard
                icon={OCRIcon}
                label="OCR Status"
                value={
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${ocrStatus.bg} ${ocrStatus.color}`}>
                    <OCRIcon className="h-3.5 w-3.5" />
                    {ocrStatus.text}
                  </span>
                }
                delay={0.5}
              />
              {file.folder_id && (
                <FileInfoCard
                  icon={Folder}
                  label="Folder"
                  value={
                    <button
                      onClick={handleGoToFolder}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Go to folder →
                    </button>
                  }
                  delay={0.55}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <FileActionsBar
              onDownload={handleDownload}
              onPrint={isPDF ? handlePrint : undefined}
              onShare={handleShare}
              onGoToFolder={handleGoToFolder}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* OCR Text Section */}
      {file.ocr_status === 'completed' && file.ocr_text && (
        <OCRTextViewer text={file.ocr_text} fileName={file.filename} />
      )}
    </div>
  )
}