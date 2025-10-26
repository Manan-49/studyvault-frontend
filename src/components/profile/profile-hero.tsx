'use client'

import { motion } from 'framer-motion'
import { Camera, Clock, Calendar } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getAvatarUrl, getUserInitials, getAvatarColor } from '@/lib/utils/avatar'

interface ProfileHeroProps {
  user: any
  stats: { files: number; storage: number; notes: number }
  loading: boolean
  onAvatarClick: () => void
}

export default function ProfileHero({
  user,
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
    if (mb >= 1024) {
      const gb = mb / 1024
      return `${gb.toFixed(2)} GB`
    }
    return `${mb.toFixed(2)} MB`
  }

  // ✅ Use avatar helper
  const avatarUrl = user?.id ? getAvatarUrl(user.id, user.avatar_url) : undefined
  const initials = getUserInitials(user?.name || '')
  const avatarColor = user?.id ? getAvatarColor(user.id) : 'from-blue-500 to-purple-600'

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Avatar Section */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="group relative"
          >
            <div className="relative">
              {/* Gradient Ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-75 blur-lg transition-opacity group-hover:opacity-100" />

              {/* Avatar Container */}
              <div className="relative h-32 w-32 rounded-full bg-card p-1">
                <Avatar className="h-full w-full">
                  <AvatarImage src={avatarUrl} alt={user?.name} />
                  <AvatarFallback className={`bg-gradient-to-br ${avatarColor} text-3xl font-bold text-white`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Upload Overlay */}
              <motion.button
                onClick={onAvatarClick}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Change avatar"
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
              className="text-3xl font-bold text-white md:text-4xl"
            >
              {user?.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-blue-100"
            >
              {user?.email}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 text-sm text-blue-100"
            >
              <div className="flex items-center gap-1.5 rounded-full bg-card/10 px-3 py-1.5 backdrop-blur-sm">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user?.created_at || new Date().toISOString())}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-card/10 px-3 py-1.5 backdrop-blur-sm">
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
        <div className="mx-auto h-8 w-12 animate-pulse rounded bg-card/20" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
      <div className="mt-1 text-xs text-blue-200">{label}</div>
    </div>
  )
}