'use client'

import { motion } from 'framer-motion'

interface LoadingGridProps {
  count?: number
  viewMode?: 'grid' | 'list' | 'compact'
}

export function LoadingGrid({ count = 8, viewMode = 'grid' }: LoadingGridProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="aspect-[4/3] animate-pulse bg-gray-200 dark:bg-gray-800" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="flex justify-between">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}