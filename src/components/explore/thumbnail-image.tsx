'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react'

interface ThumbnailImageProps {
  src: string
  alt: string
  mimeType?: string
  className?: string
}

export function ThumbnailImage({ src, alt, mimeType, className = '' }: ThumbnailImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  const getFallbackIcon = () => {
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="h-16 w-16 text-blue-400" />
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="h-16 w-16 text-red-400" />
    }
    return <File className="h-16 w-16 text-gray-400" />
  }

  // Auto-retry once after 2 seconds
  const handleError = () => {
    if (retryCount < 1) {
      setTimeout(() => {
        setRetryCount(retryCount + 1)
        setLoading(true)
        setError(false)
      }, 2000)
    } else {
      setError(true)
      setLoading(false)
    }
  }

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 ${className}`}>
        {getFallbackIcon()}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      <Image
        key={retryCount} // Force re-render on retry
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onLoad={() => setLoading(false)}
        onError={handleError}
        unoptimized // For external URLs
      />
    </div>
  )
}