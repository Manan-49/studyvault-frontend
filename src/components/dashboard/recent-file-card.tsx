'use client'

import { motion } from 'framer-motion'
import { FileText, Image, File } from 'lucide-react'
import Link from 'next/link'
import { formatBytes } from '@/lib/utils/format'
import { formatDistanceToNow } from 'date-fns'

interface RecentFileCardProps {
  file: {
    id: string
    title: string
    size_bytes: number
    created_at: string
    ocr_status: string
    file_type?: string
  }
  index: number
}

const getFileIcon = (type?: string) => {
  if (type?.startsWith('image')) return Image
  if (type?.includes('pdf')) return FileText
  return File
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'processing':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function RecentFileCard({ file, index }: RecentFileCardProps) {
  const Icon = getFileIcon(file.file_type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="w-full"
    >
      <Link href={`/explore/${file.id}`} className="block w-full">
        <div className="group relative w-full overflow-hidden rounded-lg border border-border bg-card p-3 transition-all hover:border-primary hover:shadow-md sm:rounded-xl sm:p-4">
          {/* Hover gradient effect */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative flex w-full items-center gap-3 sm:gap-4">
            {/* Icon */}
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-12 sm:w-12 sm:rounded-xl"
            >
              <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </motion.div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-semibold text-card-foreground sm:text-base">
                {file.title}
              </h4>
              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                {formatBytes(file.size_bytes)}
                <span className="hidden sm:inline">
                  {' • '}
                  {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                </span>
              </p>
            </div>

            {/* Status Badge - Hidden on very small screens */}
            <span
              className={`hidden flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sm:inline-block sm:px-3 sm:text-xs ${getStatusColor(file.ocr_status)}`}
            >
              {file.ocr_status}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}