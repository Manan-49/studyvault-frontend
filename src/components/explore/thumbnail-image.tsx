'use client'

import { FileText, Image as ImageIcon, File, FileCode, FileSpreadsheet, FileVideo } from 'lucide-react'

interface ThumbnailImageProps {
  src: string
  alt: string
  mimeType?: string
  className?: string
}

export function ThumbnailImage({ mimeType, className = '' }: ThumbnailImageProps) {
  const getFileIcon = () => {
    if (!mimeType) {
      return { icon: File, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' }
    }

    // Images
    if (mimeType.startsWith('image/')) {
      return { icon: ImageIcon, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' }
    }

    // PDFs
    if (mimeType === 'application/pdf') {
      return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' }
    }

    // Documents
    if (
      mimeType.includes('word') ||
      mimeType.includes('document') ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' }
    }

    // Spreadsheets
    if (
      mimeType.includes('sheet') ||
      mimeType.includes('excel') ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' }
    }

    // Code files
    if (
      mimeType.includes('json') ||
      mimeType.includes('javascript') ||
      mimeType.includes('html') ||
      mimeType.includes('css')
    ) {
      return { icon: FileCode, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' }
    }

    // Videos
    if (mimeType.startsWith('video/')) {
      return { icon: FileVideo, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' }
    }

    // Default
    return { icon: File, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30' }
  }

  const { icon: Icon, color, bg } = getFileIcon()

  return (
    <div className={`flex items-center justify-center ${bg} ${className}`}>
      <Icon className={`h-12 w-12 ${color}`} />
    </div>
  )
}