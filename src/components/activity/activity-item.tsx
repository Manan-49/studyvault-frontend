'use client'

import { motion } from 'framer-motion'
import { 
  FileText, 
  FolderPlus, 
  LogIn, 
  Key, 
  Download, 
  Upload,
  Trash2,
  Edit,
  Share2,
  LucideIcon
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItemProps {
  activity: {
    id: string
    type: string
    user_name: string
    timestamp: string
    metadata?: Record<string, any>
  }
  index: number
}

const activityConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  file_uploaded: { icon: Upload, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  file_downloaded: { icon: Download, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  folder_created: { icon: FolderPlus, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  login: { icon: LogIn, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  password_changed: { icon: Key, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  file_deleted: { icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  file_updated: { icon: Edit, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  file_shared: { icon: Share2, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/30' },
}

export function ActivityItem({ activity, index }: ActivityItemProps) {
  const config = activityConfig[activity.type] || { 
    icon: FileText, 
    color: 'text-muted-foreground', 
    bg: 'bg-muted' 
  }
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      className="group"
    >
      <div className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
        {/* Icon */}
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h3 className="font-semibold capitalize text-card-foreground">
                {activity.type.replace(/_/g, ' ')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                By <span className="font-medium">{activity.user_name}</span>
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </span>
          </div>

          {/* Metadata */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 overflow-hidden rounded-lg bg-muted"
            >
              <div className="p-3">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-card-foreground">
                      {key}:
                    </span>
                    <span className="text-muted-foreground">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Empty State Component
export function EmptyActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted py-16"
    >
      <div className="rounded-full bg-muted p-6">
        <FileText className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No activity yet
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Activity logs will appear here once you start using the app
      </p>
    </motion.div>
  )
}

// Loading Skeleton
export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 rounded-xl border border-border bg-card p-4"
        >
          <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}