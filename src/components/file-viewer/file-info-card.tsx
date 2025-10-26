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
      <div className="rounded-lg bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
      </div>
    </motion.div>
  )
}