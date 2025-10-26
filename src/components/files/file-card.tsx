'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { filesApi } from '@/lib/api/files'
import { storage } from '@/lib/utils/storage'
import { FileText, Download, Eye, Trash2, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { File } from '@/types'

interface FileCardProps {
  file: File
  onDelete?: (id: string) => void
  onEdit?: (file: File) => void
}

export function FileCard({ file, onDelete, onEdit }: FileCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async () => {
    try {
      const response = await filesApi.download(file.id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const thumbnailUrl = file.thumbnail_url
    ? `${process.env.NEXT_PUBLIC_API_URL}${file.thumbnail_url}`
    : null

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-4">
        <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
          {thumbnailUrl && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${thumbnailUrl}?token=${storage.getAccessToken()}`}
              alt={file.title}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Link href={`/files/${file.id}`}>
            <h3 className="line-clamp-1 font-semibold hover:underline">{file.title}</h3>
          </Link>

          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>{formatBytes(file.size_bytes)}</span>
            <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                file.ocr_status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : file.ocr_status === 'processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : file.ocr_status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              OCR: {file.ocr_status}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Link href={`/files/${file.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(file)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(file.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
