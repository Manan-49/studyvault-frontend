'use client'

import { motion } from 'framer-motion'
import { Home, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'

interface FileBreadcrumbProps {
  fileName: string
  folderPath?: string
  folderId?: string
}

export function FileBreadcrumb({ fileName, folderPath, folderId }: FileBreadcrumbProps) {
  const pathSegments = folderPath ? folderPath.split('/').filter(Boolean) : []

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 overflow-x-auto pb-2 text-sm"
    >
      <Link href="/explore">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-700 dark:text-gray-300">Root</span>
        </motion.div>
      </Link>

      {pathSegments.map((segment, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">{segment}</span>
        </div>
      ))}

      {folderId && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link href={`/explore?folder_id=${folderId}`}>
            <span className="whitespace-nowrap text-blue-600 hover:underline dark:text-blue-400">
              Current Folder
            </span>
          </Link>
        </>
      )}

      <ChevronRight className="h-4 w-4 text-gray-400" />
      <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1 dark:bg-blue-900/30">
        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="truncate font-semibold text-blue-700 dark:text-blue-300">{fileName}</span>
      </div>
    </motion.div>
  )
}