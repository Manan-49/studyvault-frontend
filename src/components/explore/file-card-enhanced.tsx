'use client'

import { motion } from 'framer-motion'
import { 
  Download, 
  FolderInput, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye
} from 'lucide-react'
import { formatBytes } from '@/lib/utils/format'
import { formatDistanceToNow } from 'date-fns'
import { ThumbnailImage } from './thumbnail-image'

interface FileCardProps {
  file: {
    id: string
    title: string
    filename: string
    size_bytes: number
    created_at: string
    ocr_status: string
    mime_type: string
    thumbnail_url?: string
  }
  onClick: () => void
  onDownload: () => void
  onMove: () => void
  onDelete: () => void
  index: number
  viewMode?: 'grid' | 'list' | 'compact'
}

const STATUS_CONFIG = {
  completed: { 
    icon: CheckCircle, 
    label: 'Done', 
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
  },
  processing: { 
    icon: Clock, 
    label: 'Processing', 
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' 
  },
  failed: { 
    icon: XCircle, 
    label: 'Failed', 
    className: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' 
  },
  pending: { 
    icon: Clock, 
    label: 'Pending', 
    className: 'bg-muted text-muted-foreground' 
  },
} as const

export function FileCardEnhanced({ 
  file, 
  onClick, 
  onDownload, 
  onMove, 
  onDelete, 
  index, 
  viewMode = 'list'
}: FileCardProps) {
  const status = STATUS_CONFIG[file.ocr_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
  const StatusIcon = status.icon

  // List View (DEFAULT)
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
        onClick={onClick}
      >
        {/* Icon */}
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
          <ThumbnailImage
            src={file.thumbnail_url || ''}
            alt={file.title}
            mimeType={file.mime_type}
            className="h-full w-full"
          />
        </div>
        
        {/* File Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {file.title}
          </h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{formatBytes(file.size_bytes)}</span>
            <span>•</span>
            <span className="hidden sm:inline">
              {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="hidden md:flex">
          <StatusBadge icon={StatusIcon} label={status.label} className={status.className} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ActionIconButton 
            icon={Eye} 
            onClick={(e) => { e.stopPropagation(); onClick(); }} 
            label="View"
            className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          />
          <ActionIconButton 
            icon={Download} 
            onClick={(e) => { e.stopPropagation(); onDownload(); }} 
            label="Download"
          />
          <ActionIconButton 
            icon={FolderInput} 
            onClick={(e) => { e.stopPropagation(); onMove(); }} 
            label="Move"
          />
          <ActionIconButton 
            icon={Trash2} 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            label="Delete"
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          />
        </div>
      </motion.div>
    )
  }

  // Compact View
  if (viewMode === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-sm cursor-pointer"
        onClick={onClick}
      >
        {/* Icon - Square */}
        <div className="relative aspect-square overflow-hidden">
          <ThumbnailImage
            src={file.thumbnail_url || ''}
            alt={file.title}
            mimeType={file.mime_type}
            className="h-full w-full"
          />
          
          {/* Status Badge Overlay */}
          <div className="absolute right-2 top-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-sm ${status.className}`}>
              <StatusIcon className="h-3 w-3" />
            </div>
          </div>
        </div>
        
        {/* File Info */}
        <div className="p-3">
          <h3 className="truncate text-sm font-medium text-card-foreground">
            {file.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatBytes(file.size_bytes)}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex border-t border-border">
          <CompactActionButton icon={Download} onClick={(e) => { e.stopPropagation(); onDownload(); }} />
          <CompactActionButton icon={FolderInput} onClick={(e) => { e.stopPropagation(); onMove(); }} />
          <CompactActionButton icon={Trash2} onClick={(e) => { e.stopPropagation(); onDelete(); }} danger />
        </div>
      </motion.div>
    )
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      {/* Icon - 4:3 Aspect */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ThumbnailImage
          src={file.thumbnail_url || ''}
          alt={file.title}
          mimeType={file.mime_type}
          className="h-full w-full"
        />
        
        {/* Status Badge */}
        <div className="absolute right-2 top-2">
          <StatusBadge icon={StatusIcon} label={status.label} className={status.className} />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-full items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-card px-4 py-2 text-sm font-semibold text-card-foreground shadow-lg"
            >
              View File
            </motion.button>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="p-4">
        <h3 className="truncate font-semibold text-card-foreground">
          {file.title}
        </h3>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {file.filename}
        </p>
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatBytes(file.size_bytes)}</span>
          <span className="hidden sm:inline">{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <CompactActionButton icon={Download} onClick={(e) => { e.stopPropagation(); onDownload(); }} label="Download" />
        <CompactActionButton icon={FolderInput} onClick={(e) => { e.stopPropagation(); onMove(); }} label="Move" />
        <CompactActionButton icon={Trash2} onClick={(e) => { e.stopPropagation(); onDelete(); }} label="Delete" danger />
      </div>
    </motion.div>
  )
}

// ========== Sub-Components ==========

function StatusBadge({ 
  icon: Icon, 
  label, 
  className
}: { 
  icon: any
  label: string
  className: string
}) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  )
}

function ActionIconButton({ 
  icon: Icon, 
  onClick, 
  label,
  className = 'text-muted-foreground hover:bg-muted hover:text-foreground'
}: {
  icon: any
  onClick: (e: React.MouseEvent) => void
  label: string
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function CompactActionButton({ 
  icon: Icon, 
  onClick, 
  label,
  danger 
}: {
  icon: any
  onClick: (e: React.MouseEvent) => void
  label?: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 border-r border-border py-2.5 text-xs font-medium transition-colors last:border-r-0 ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-muted-foreground hover:bg-muted'
      }`}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      {label && <span className="hidden lg:inline">{label}</span>}
    </button>
  )
}