'use client'

import { Suspense } from 'react'
import LoginContent from './login-content'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/50 dark:to-indigo-950/30">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}