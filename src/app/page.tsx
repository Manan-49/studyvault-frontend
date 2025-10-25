// src/app/page.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/lib/utils/storage'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = storage.getAccessToken()
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}