'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users, HardDrive, Activity, Upload, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatBytes } from '@/lib/utils/format'
import { statsApi } from '@/lib/api/stats'
import { filesApi } from '@/lib/api/files'
import { StatCard } from '@/components/dashboard/stat-card'
import { StorageChart } from '@/components/dashboard/storage-chart'
import { RecentFileCard } from '@/components/dashboard/recent-file-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { DashboardSkeleton } from '@/components/dashboard/loading-skeleton'

interface Stats {
  files_total: number
  users_total: number
  active_users: number
  storage_used_bytes: number
  storage_quota_bytes: number
}

interface FileItem {
  id: string
  title: string
  size_bytes: number
  created_at: string
  ocr_status: string
  file_type?: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [statsData, filesData] = await Promise.all([
          statsApi.get(),
          filesApi.list({ page: 1, page_size: 5 }),
        ])

        setStats(statsData)
        setRecentFiles(filesData.items || [])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[400px] items-center justify-center"
      >
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Activity className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Something went wrong
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 sm:rounded-3xl sm:p-6 lg:p-8"
      >
        {/* Decorative blur circles - CONTAINED */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl sm:-right-20 sm:-top-20 sm:h-64 sm:w-64" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-400/20 blur-3xl sm:-bottom-20 sm:-left-20 sm:h-64 sm:w-64" />
        
        <div className="relative flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <h1 className="truncate text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                {getGreeting()}!
              </h1>
              <motion.div
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex-shrink-0"
              >
                <Sparkles className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6 md:h-7 md:w-7" />
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base"
            >
              Here's what's happening with your vault today
            </motion.p>
          </div>

          {/* Quick Upload Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex-shrink-0 sm:w-auto"
          >
            <Link href="/explore" className="block w-full sm:inline-block">
              <button className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl sm:w-auto sm:px-6 sm:py-3">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Upload Files</span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid - 2 cols on mobile, 4 on desktop */}
      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Total Files"
          value={stats?.files_total || 0}
          subtitle="Across all folders"
          icon={FileText}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          iconColor="text-white"
          trend="+12%"
          delay={0}
        />
        <StatCard
          title="Total Users"
          value={stats?.users_total || 0}
          subtitle={`${stats?.active_users || 0} active`}
          icon={Users}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          iconColor="text-white"
          delay={0.1}
        />
        <StatCard
          title="Storage"
          value={stats ? formatBytes(stats.storage_used_bytes) : '0 B'}
          subtitle={`of ${stats ? formatBytes(stats.storage_quota_bytes) : '0 B'}`}
          icon={HardDrive}
          gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          iconColor="text-white"
          delay={0.2}
        />
        <StatCard
          title="Active"
          value={stats?.active_users || 0}
          subtitle="Online now"
          icon={Activity}
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
          iconColor="text-white"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid - Stack on mobile, side-by-side on desktop */}
      <div className="grid w-full gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-6">
        {/* Recent Files - Full width on mobile, 2 cols on desktop */}
        <div className="w-full min-w-0 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <h3 className="text-base font-semibold text-card-foreground sm:text-lg">
                Recent Files
              </h3>
              <Link href="/explore">
                <motion.button
                  whileHover={{ x: 4 }}
                  className="group flex items-center gap-1.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 sm:gap-2 sm:text-sm"
                >
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
                </motion.button>
              </Link>
            </div>

            {recentFiles.length > 0 ? (
              <div className="w-full space-y-2 sm:space-y-3">
                {recentFiles.map((file, index) => (
                  <RecentFileCard key={file.id} file={file} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 sm:py-16"
              >
                <div className="mb-3 rounded-full bg-muted p-4 sm:mb-4 sm:p-6">
                  <FileText className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
                </div>
                <h4 className="mb-1 text-sm font-semibold text-foreground sm:mb-2 sm:text-base">
                  No files yet
                </h4>
                <p className="mb-3 text-center text-xs text-muted-foreground sm:mb-4 sm:text-sm">
                  Upload your first file to get started
                </p>
                <Link href="/explore">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 sm:px-4 sm:text-sm"
                  >
                    Upload Now
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Full width on mobile, 1 col on desktop */}
        <div className="w-full min-w-0 space-y-4 sm:space-y-6">
          <StorageChart
            used={stats?.storage_used_bytes || 0}
            total={stats?.storage_quota_bytes || 10 * 1024 * 1024 * 1024} 
          />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}