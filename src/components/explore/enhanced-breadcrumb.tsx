'use client'

import { motion } from 'framer-motion'
import { Home, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbProps {
  path: string[]
  currentFolderId?: string
}

export function EnhancedBreadcrumb({ path, currentFolderId }: BreadcrumbProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 overflow-x-auto pb-2 text-sm"
    >
      {/* Home/Root */}
      <Link href="/explore">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-accent"
        >
          <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-card-foreground">Root</span>
        </motion.div>
      </Link>

      {/* Path segments */}
      {path.map((segment, index) => {
        const isLast = index === path.length - 1
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 ${
                isLast
                  ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-muted-foreground'
              }`}
            >
              {segment}
            </motion.span>
          </div>
        )
      })}
    </motion.div>
  )
}