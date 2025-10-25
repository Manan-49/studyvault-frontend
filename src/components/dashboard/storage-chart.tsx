'use client'

import { motion } from 'framer-motion'
import { formatBytes } from '@/lib/utils/format'

interface StorageChartProps {
  used: number
  total: number
}

export function StorageChart({ used, total }: StorageChartProps) {
  // ✅ FIX: Handle null/undefined/zero total
  const DEFAULT_QUOTA = 10 * 1024 * 1024 * 1024 // 10 GB
  const safeTotal = total && total > 0 ? total : DEFAULT_QUOTA
  const safeUsed = used || 0
  
  const percentage = Math.min((safeUsed / safeTotal) * 100, 100)
  const available = safeTotal - safeUsed
  const isNearLimit = percentage > 80

  // Responsive circle radius
  const radius = 60 // Smaller for mobile
  const circumference = 2 * Math.PI * radius

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-2xl sm:p-6"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
        Storage Usage
      </h3>

      {/* Circular Progress */}
      <div className="mt-4 flex items-center justify-center sm:mt-6">
        <div className="relative h-32 w-32 sm:h-40 sm:w-40">
          {/* Background Circle */}
          <svg className="h-full w-full -rotate-90 transform">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-gray-200 dark:text-gray-800"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (circumference * percentage) / 100 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              strokeDasharray={circumference}
              className={isNearLimit ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl"
            >
              {percentage.toFixed(0)}%
            </motion.span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Used</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 space-y-2 sm:mt-6">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">Used</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatBytes(safeUsed)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatBytes(safeTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600 dark:text-gray-400">Available</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {formatBytes(available)}
          </span>
        </div>
      </div>

      {/* Warning if near limit */}
      {isNearLimit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-lg bg-red-50 p-2.5 dark:bg-red-900/20 sm:mt-4 sm:p-3"
        >
          <p className="text-[10px] text-red-800 dark:text-red-400 sm:text-xs">
            ⚠️ You're running low on storage space
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}