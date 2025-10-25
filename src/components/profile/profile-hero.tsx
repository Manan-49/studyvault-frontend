'use client'

import { motion } from 'framer-motion'
import { Camera, Clock, Calendar } from 'lucide-react'

interface ProfileHeroProps {
  user: any
  avatarUrl?: string
  stats: { files: number; storage: number; notes: number }
  loading: boolean
  onAvatarClick: () => void
}

export default function ProfileHero({
  user,
  avatarUrl,
  stats,
  loading,
  onAvatarClick,
}: ProfileHeroProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative group"
          >
            <div className="relative">
              {/* Gradient Ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
              
              {/* Avatar */}
              <div className="relative h-32 w-32 rounded-full bg-white p-1">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Overlay */}
              <motion.button
                onClick={onAvatarClick}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera className="h-8 w-8 text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* User Info */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-white"
            >
              {user?.name}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-blue-100 text-lg"
            >
              {user?.email}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 text-sm text-blue-100"
            >
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user?.created_at || new Date().toISOString())}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4" />
                <span>Last active today</span>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-8 pt-4"
          >
            <StatItem label="Files" value={stats.files} loading={loading} />
            <StatItem label="Storage" value={formatStorage(stats.storage)} loading={loading} />
            <StatItem label="Notes" value={stats.notes} loading={loading} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, loading }: { label: string; value: any; loading: boolean }) {
  return (
    <div className="text-center">
      {loading ? (
        <div className="h-8 w-12 bg-white/20 rounded animate-pulse mx-auto" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
      <div className="text-xs text-blue-200 mt-1">{label}</div>
    </div>
  )
}