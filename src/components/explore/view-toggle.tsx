'use client'

import { motion } from 'framer-motion'
import { Grid3x3, List, LayoutGrid } from 'lucide-react'

export type ViewMode = 'grid' | 'list' | 'compact'

interface ViewToggleProps {
  view: ViewMode
  onChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const views: { mode: ViewMode; icon: any; label: string }[] = [
    { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
    { mode: 'list', icon: List, label: 'List' },
    { mode: 'compact', icon: Grid3x3, label: 'Compact' },
  ]

  return (
    <div className="flex items-center gap-1 rounded-xl border-2 border-border bg-background p-1">
      {views.map(({ mode, icon: Icon, label }) => (
        <motion.button
          key={mode}
          onClick={() => onChange(mode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            view === mode
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {view === mode && (
            <motion.div
              layoutId="activeView"
              className="absolute inset-0 rounded-lg bg-blue-100 dark:bg-blue-900/30"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon className="relative z-10 h-4 w-4" />
          <span className="relative z-10 hidden sm:inline">{label}</span>
        </motion.button>
      ))}
    </div>
  )
}