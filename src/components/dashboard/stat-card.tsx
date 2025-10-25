'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  gradient: string
  iconColor: string
  trend?: string
  delay?: number
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:rounded-2xl sm:p-6"
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5 ${gradient}`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
              {title}
            </p>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
              className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:mt-2 sm:text-3xl"
            >
              {value}
            </motion.div>
          </div>

          {/* Icon */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className={`rounded-lg ${gradient} p-2 sm:rounded-xl sm:p-3`}
          >
            <Icon className={`h-4 w-4 ${iconColor} sm:h-5 sm:w-5`} />
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between sm:mt-4">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
            {subtitle}
          </p>
          {trend && (
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400 sm:text-xs">
              {trend}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}