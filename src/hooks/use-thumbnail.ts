import { useState, useEffect } from 'react'
import { buildApiUrl } from '@/lib/utils/api-url'
import { storage } from '@/lib/utils/storage'

export function useThumbnail(thumbnailUrl?: string) {
  const [url, setUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!thumbnailUrl)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!thumbnailUrl) {
      setIsLoading(false)
      return
    }

    let objectUrl: string | null = null

    const loadThumbnail = async () => {
      try {
        const token = storage.getAccessToken()
        const response = await fetch(buildApiUrl(thumbnailUrl), {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error('Failed to load')

        const blob = await response.blob()
        if (blob.size === 0) throw new Error('Empty thumbnail')

        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
        setHasError(false)
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadThumbnail()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [thumbnailUrl])

  return { thumbnailUrl: url, isLoading, hasError }
}