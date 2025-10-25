'use client'

import { motion } from 'framer-motion'
import { Upload, StickyNote, FolderPlus, Clock } from 'lucide-react'
import Link from 'next/link'

const actions = [
  {
    name: 'Upload File',
    icon: Upload,
    href: '/explore',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Notes',
    icon: StickyNote,
    href: '/notes',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    name: 'New Folder',
    icon: FolderPlus,
    href: '/explore',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Activity',
    icon: Clock,
    href: '/activity',
    gradient: 'from-orange-500 to-red-600',
  },
]

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-2xl sm:p-6"
    >
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
        Quick Actions
      </h3>

      <div className="mt-3 grid w-full grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Link href={action.href} className="block w-full">
              <div className="group relative w-full overflow-hidden rounded-lg border border-gray-200 p-3 transition-all hover:border-transparent hover:shadow-lg dark:border-gray-800 sm:rounded-xl sm:p-4">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
                
                <div className="relative flex flex-col items-center gap-1.5 text-center sm:gap-2">
                  <div className={`rounded-lg bg-gradient-to-br ${action.gradient} p-2 transition-all group-hover:bg-white/20 sm:p-2.5`}>
                    <action.icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-[11px] font-medium leading-tight text-gray-700 transition-colors group-hover:text-white dark:text-gray-300 sm:text-sm">
                    {action.name}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}