'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Search, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { activityApi } from '@/lib/api/activity'
import { ActivityItem, EmptyActivity, ActivitySkeleton } from '@/components/activity/activity-item'

interface Activity {
  id: string
  type: string
  user_name: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ActivityResponse {
  items: Activity[]
  meta: {
    total: number
    page: number
    page_size: number
  }
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [exporting, setExporting] = useState(false)

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const data: ActivityResponse = await activityApi.list({
        page,
        page_size: 20,
        ...(typeFilter && { type: typeFilter }),
      })

      setActivities(data.items || [])
      setTotalPages(Math.ceil(data.meta.total / data.meta.page_size))
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Export CSV
  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const blob = await activityApi.exportCSV()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  // Filter activities by search
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            📊 Activity Log
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Track all actions and events across your account
          </p>
        </div>

        {/* Export Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        >
          <Download className="h-5 w-5" />
          <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
            className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white pl-12 pr-12 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div className="relative sm:w-64">
          <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border-2 border-gray-200 bg-white pl-12 pr-10 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="file_uploaded">File Uploaded</option>
            <option value="file_downloaded">File Downloaded</option>
            <option value="folder_created">Folder Created</option>
            <option value="login">Login</option>
            <option value="password_changed">Password Changed</option>
          </select>
        </div>
      </motion.div>

      {/* Activity List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <ActivitySkeleton key="loading" />
        ) : filteredActivities.length === 0 ? (
          <EmptyActivity key="empty" />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredActivities.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>

          <div className="flex items-center gap-2 px-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Page {page} of {totalPages}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}