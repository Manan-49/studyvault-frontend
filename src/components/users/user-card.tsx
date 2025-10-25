'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Calendar, Shield, Trash2, Ban, Users, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { buildApiUrl } from '@/lib/utils/api-url'
import { storage } from '@/lib/utils/storage'

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar_url?: string
    created_at: string
    is_online?: boolean
  }
  isCurrentUser: boolean
  isAdmin: boolean
  onDelete: (id: string, name: string) => void
  onBlock: (id: string, name: string) => void
  index: number
}

export function UserCard({ user, isCurrentUser, isAdmin, onDelete, onBlock, index }: UserCardProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!user.avatar_url) return

    const loadAvatar = async () => {
      try {
        const token = storage.getAccessToken()
        const fullUrl = buildApiUrl(user.avatar_url!)
        const response = await fetch(fullUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setAvatarUrl(url)
        }
      } catch (error) {
        console.error('Failed to load avatar:', error)
      }
    }

    loadAvatar()
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    }
  }, [user.avatar_url])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* Gradient overlay for current user */}
        {isCurrentUser && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 dark:from-blue-950/20 dark:to-indigo-950/20" />
        )}

        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-900">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {/* Online indicator */}
            {user.is_online && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 dark:border-gray-900"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              </motion.span>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Name & Role Badge */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {user.name}
                {isCurrentUser && (
                  <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">(You)</span>
                )}
              </h3>
              {user.role === 'admin' && (
                <div className="flex-shrink-0 rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900/30">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && !isCurrentUser && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onBlock(user.id, user.name)}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition-all hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                >
                  <Ban className="h-4 w-4" />
                  <span>Block</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(user.id, user.name)}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Empty State
export function EmptyUsers({ searchTerm }: { searchTerm?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-900/50"
    >
      <div className="rounded-full bg-gray-200 p-6 dark:bg-gray-800">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        {searchTerm ? 'No users found' : 'No users yet'}
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {searchTerm ? 'Try a different search term' : 'Users will appear here once they register'}
      </p>
    </motion.div>
  )
}

// Loading Skeleton
export function UsersSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}