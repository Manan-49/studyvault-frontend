'use client'

import { motion } from 'framer-motion'
import { FolderOpen, MoreVertical, Trash2, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

interface FolderCardProps {
  folder: {
    id: string
    name: string
    path: string
    created_at: string
  }
  onClick: () => void
  onDelete: () => void
  index: number
}

// Auto-assign gradient based on folder name
const getGradient = (name: string) => {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('math') || lowerName.includes('algebra') || lowerName.includes('calculus')) {
    return 'from-blue-500 to-cyan-500'
  }
  if (lowerName.includes('science') || lowerName.includes('physics') || lowerName.includes('chemistry')) {
    return 'from-green-500 to-emerald-500'
  }
  if (lowerName.includes('history') || lowerName.includes('social')) {
    return 'from-purple-500 to-pink-500'
  }
  if (lowerName.includes('english') || lowerName.includes('literature')) {
    return 'from-orange-500 to-red-500'
  }
  if (lowerName.includes('art') || lowerName.includes('design')) {
    return 'from-pink-500 to-rose-500'
  }
  if (lowerName.includes('music')) {
    return 'from-violet-500 to-purple-500'
  }
  
  // Default gradient
  return 'from-gray-600 to-slate-600'
}

export function FolderCardEnhanced({ folder, onClick, onDelete, index }: FolderCardProps) {
  const [showActions, setShowActions] = useState(false)
  const gradient = getGradient(folder.name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className="group relative cursor-pointer"
    >
      <div
        onClick={onClick}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-xl"
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 transition-opacity group-hover:opacity-10`} />

        {/* Content */}
        <div className="relative">
          {/* Icon & Actions */}
          <div className="mb-4 flex items-start justify-between">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className={`rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg`}
            >
              <FolderOpen className="h-6 w-6 text-white" />
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
              className="flex gap-1"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </div>

          {/* Folder Info */}
          <h3 className="mb-1 truncate text-lg font-semibold text-card-foreground">
            {folder.name}
          </h3>
          <p className="mb-3 truncate text-xs text-muted-foreground">
            {folder.path}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}