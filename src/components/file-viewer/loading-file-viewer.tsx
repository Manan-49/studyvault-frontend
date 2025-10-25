'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function LoadingFileViewer() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="h-8 w-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview skeleton */}
        <div className="lg:col-span-2">
          <div className="flex h-[600px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  )
}