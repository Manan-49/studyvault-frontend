'use client'

import { Moon, Sun, Monitor, Smartphone } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, color: 'text-orange-500' },
    { value: 'dark', label: 'Dark', icon: Moon, color: 'text-blue-500' },
    { value: 'night', label: 'Night', icon: Monitor, color: 'text-indigo-500' },
    { value: 'amoled', label: 'AMOLED', icon: Smartphone, color: 'text-gray-400' },
  ] as const

  const currentTheme = themes.find((t) => t.value === theme) || themes[0]
  const Icon = currentTheme.icon

  if (!mounted) {
    return (
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Sun className="h-4 w-4 text-orange-500" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
          <Icon className={`h-4 w-4 ${currentTheme.color}`} />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {themes.map(({ value, label, icon: ThemeIcon, color }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex cursor-pointer items-center gap-2"
          >
            <ThemeIcon className={`h-4 w-4 ${color}`} />
            <span className="flex-1">{label}</span>
            {theme === value && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-blue-600 dark:text-blue-400"
              >
                ✓
              </motion.span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}