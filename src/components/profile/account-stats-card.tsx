'use client'

import { motion } from 'framer-motion'
import { FileText, HardDrive, BookOpen, TrendingUp } from 'lucide-react'

interface AccountStatsCardProps {
  stats: {
    files: number
    storage: number
    notes: number
  }
  loading: boolean
}

export default function AccountStatsCard({ stats, loading }: AccountStatsCardProps) {
  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const statItems = [
    {
      icon: FileText,
      label: 'Total Files',
      value: stats.files,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: formatStorage(stats.storage),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: BookOpen,
      label: 'Notes Created',
      value: stats.notes,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: '+12',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Account Statistics</h2>
        <p className="text-sm text-slate-600 mt-1">Your activity overview</p>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`${item.bgColor} rounded-xl p-5 border border-slate-200 hover:shadow-md transition-all cursor-default`}
            >
              <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${item.color} mb-3`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              
              <div className="space-y-1">
                {loading ? (
                  <div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                )}
                <div className="text-xs font-medium text-slate-600">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}