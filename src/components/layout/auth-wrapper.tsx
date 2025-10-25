'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth'
import { storage } from '@/lib/utils/storage'
import { Loader2 } from 'lucide-react'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      const token = storage.getAccessToken()

      // No token, redirect to login
      if (!token) {
        router.push('/login')
        return
      }

      // Already have user data, no need to fetch again
      if (user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userData = await authApi.getMe()
        setUser(userData)
        setError(false)
      } catch (err) {
        console.error('[AuthWrapper] Authentication failed:', err)
        setError(true)
        logout()
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [mounted, user, setUser, logout, router])

  // Don't render anything until mounted (avoid hydration mismatch)
  if (!mounted) {
    return null
  }

  // Show loading state while verifying auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return null // Will redirect to login
  }

  // User is authenticated
  return <>{children}</>
}