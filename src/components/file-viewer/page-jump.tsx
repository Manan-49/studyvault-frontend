'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'

interface PageJumpProps {
  currentPage: number
  totalPages: number
  onJumpToPage: (page: number) => void
}

export function PageJump({ currentPage, totalPages, onJumpToPage }: PageJumpProps) {
  const [inputPage, setInputPage] = useState('')

  const handleJump = () => {
    const page = parseInt(inputPage, 10)
    if (page >= 1 && page <= totalPages) {
      onJumpToPage(page)
      setInputPage('')
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-foreground">Jump to Page</h3>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder={`1-${totalPages}`}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            onKeyPress={(e) => e.key === 'Enter' && handleJump()}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleJump}
          disabled={!inputPage || parseInt(inputPage) < 1 || parseInt(inputPage) > totalPages}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Go
        </motion.button>
      </div>
    </div>
  )
}