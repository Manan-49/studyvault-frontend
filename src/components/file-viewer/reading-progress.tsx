'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock } from 'lucide-react'

interface ReadingProgressProps {
  fileId: string
  currentPage: number
  totalPages: number
  onJumpToPage: (page: number) => void
}

interface Progress {
  currentPage: number
  totalPages: number
  lastRead: string
  timeSpent: number
}

export function ReadingProgress({ fileId, currentPage, totalPages, onJumpToPage }: ReadingProgressProps) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const [timeSpent, setTimeSpent] = useState(0)

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(`reading-progress-${fileId}`)
    if (saved) {
      const data = JSON.parse(saved)
      setProgress(data)
      setTimeSpent(data.timeSpent || 0)
    }
  }, [fileId])

  // Save progress
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1)
      
      const progressData: Progress = {
        currentPage,
        totalPages,
        lastRead: new Date().toISOString(),
        timeSpent: timeSpent + 1,
      }
      
      localStorage.setItem(`reading-progress-${fileId}`, JSON.stringify(progressData))
      setProgress(progressData)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [fileId, currentPage, totalPages, timeSpent])

  const percentage = (currentPage / totalPages) * 100

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Reading Progress</span>
          <span className="font-bold text-foreground">{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-xs">Pages</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">
            {currentPage}/{totalPages}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Time</span>
          </div>
          <p className="mt-1 text-lg font-bold text-foreground">
            {formatTime(timeSpent)}
          </p>
        </div>
      </div>

      {/* Resume Reading */}
      {progress && progress.currentPage !== currentPage && progress.currentPage < totalPages && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onJumpToPage(progress.currentPage)}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Resume from page {progress.currentPage}
        </motion.button>
      )}
    </div>
  )
}