'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
}

export function SearchBarEnhanced({
  value,
  onChange,
  placeholder = 'Search files and folders...',
  resultCount,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full"
    >
      {/* Search Icon - FIXED ALIGNMENT */}
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
        <motion.div
          animate={{
            scale: localValue ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border-2 border-border bg-background pl-12 pr-20 text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
      />

      {/* Result Count & Clear Button */}
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <AnimatePresence>
          {resultCount !== undefined && localValue && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {localValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}