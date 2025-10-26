'use client'

import { motion } from 'framer-motion'
import { Download, Printer, Share2, Folder } from 'lucide-react'

interface FileActionsBarProps {
  onDownload: () => void
  onPrint?: () => void
  onShare?: () => void
  onGoToFolder?: () => void
}

export function FileActionsBar({ onDownload, onPrint, onShare, onGoToFolder }: FileActionsBarProps) {
  const actions = [
    { icon: Download, label: 'Download', onClick: onDownload },
    ...(onPrint ? [{ icon: Printer, label: 'Print', onClick: onPrint }] : []),
    ...(onShare ? [{ icon: Share2, label: 'Share', onClick: onShare }] : []),
    ...(onGoToFolder ? [{ icon: Folder, label: 'Folder', onClick: onGoToFolder }] : []),
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-3 transition-all hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
        >
          <action.icon className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  )
}