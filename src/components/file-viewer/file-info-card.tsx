'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface InfoItemProps {
  icon: LucideIcon
  label: string
  value: string | React.ReactNode
  delay?: number
}

export function FileInfoCard({ icon: Icon, label, value, delay = 0 }: InfoItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-start gap-3"
    >
      <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
      </div>
    </motion.div>
  )
}