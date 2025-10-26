'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  FolderInput, 
  Trash2, 
  FileType, 
  CheckCircle, 
  Clock, 
  XCircle 
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
  viewMode = 'grid' 
}: FileCardProps) {
  const isPDF = file.mime_type === 'application/pdf'
  const isImage = file.mime_type.startsWith('image/')
  
  const FileIcon = isImage ? ImageIcon : isPDF ? FileType : FileText
  const status = STATUS_CONFIG[file.ocr_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
  const StatusIcon = status.icon

  // List View
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        onClick={onClick}
        className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm cursor-pointer"
      >
        {/* Thumbnail - Small */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
          <ThumbnailImage
            src={file.thumbnail_url || ''}
            alt={file.title}
            mimeType={file.mime_type}
            className="h-full w-full"
          />
        </div>
        
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-card-foreground">
            {file.title}
          </h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatBytes(file.size_bytes)}</span>
            <span>•</span>
            <span className="hidden sm:inline">
              {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <StatusBadge icon={StatusIcon} label={status.label} className={status.className} compact />
        <Actions onDownload={onDownload} onMove={onMove} onDelete={onDelete} />
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
        className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-sm"
      >
        {/* Thumbnail - Square */}
        <div 
          onClick={onClick} 
          className="relative aspect-square cursor-pointer overflow-hidden bg-gradient-to-br from-muted/50 to-muted"
        >
          <ThumbnailImage
            src={file.thumbnail_url || ''}
            alt={file.title}
            mimeType={file.mime_type}
            className="h-full w-full"
          />
          
          {/* Status Badge Overlay */}
          <div className="absolute right-1.5 top-1.5">
            <StatusBadge 
              icon={StatusIcon} 
              label={status.label} 
              className={status.className} 
              iconOnly 
            />
          </div>
        </div>
        
        {/* File Info */}
        <div onClick={onClick} className="cursor-pointer p-2">
          <h3 className="truncate text-xs font-medium text-card-foreground">
            {file.title}
          </h3>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {formatBytes(file.size_bytes)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex border-t border-border">
          <ActionButton icon={Download} onClick={onDownload} label="Download" />
          <ActionButton icon={FolderInput} onClick={onMove} label="Move" />
          <ActionButton icon={Trash2} onClick={onDelete} label="Delete" danger />
        </div>
      </motion.div>
    )
  }

  // Grid View (Default)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md"
    >
      {/* Thumbnail - 4:3 Aspect */}
      <div 
        onClick={onClick} 
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-muted/50 dark:to-muted"
      >
        <ThumbnailImage
          src={file.thumbnail_url || ''}
          alt={file.title}
          mimeType={file.mime_type}
          className="h-full w-full"
        />
        
        {/* Status Badge Overlay */}
        <div className="absolute right-2 top-2">
          <StatusBadge 
            icon={StatusIcon} 
            label={status.label} 
            className={status.className} 
          />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-full items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-card px-4 py-2 text-sm font-semibold text-card-foreground shadow-lg"
              onClick={onClick}
            >
              View File
            </motion.button>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div onClick={onClick} className="cursor-pointer p-3">
        <h3 className="truncate font-medium text-card-foreground">
          {file.title}
        </h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {file.filename}
        </p>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatBytes(file.size_bytes)}</span>
          <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <ActionButton icon={Download} onClick={onDownload} label="Download" />
        <ActionButton icon={FolderInput} onClick={onMove} label="Move" />
        <ActionButton icon={Trash2} onClick={onDelete} label="Delete" danger />
      </div>
    </motion.div>
  )
}

// ========== Sub-Components ==========

function StatusBadge({ 
  icon: Icon, 
  label, 
  className, 
  iconOnly, 
  compact 
}: { 
  icon: any
  label: string
  className: string
  iconOnly?: boolean
  compact?: boolean
}) {
  if (iconOnly) {
    return (
      <div className={`flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-sm ${className}`}>
        <Icon className="h-3 w-3" />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${className}`}>
      <Icon className="h-3 w-3" />
      {!compact && <span className="hidden sm:inline">{label}</span>}
    </div>
  )
}

function Actions({ 
  onDownload, 
  onMove, 
  onDelete 
}: {
  onDownload: () => void
  onMove: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => { 
          e.stopPropagation()
          onDownload() 
        }}
        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Download"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => { 
          e.stopPropagation()
          onMove() 
        }}
        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Move"
      >
        <FolderInput className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => { 
          e.stopPropagation()
          onDelete() 
        }}
        className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function ActionButton({ 
  icon: Icon, 
  onClick, 
  label, 
  danger 
}: {
  icon: any
  onClick: () => void
  label: string
  danger?: boolean
}) {
  return (
    <button
      onClick={(e) => { 
        e.stopPropagation()
        onClick() 
      }}
      className={`flex flex-1 items-center justify-center gap-1.5 border-r border-border py-2 text-xs font-medium transition-colors last:border-r-0 ${
        danger
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-muted-foreground hover:bg-muted'
      }`}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}