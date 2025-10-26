'use client'

import { motion } from 'framer-motion'
import { Trash2, Shield, User as UserIcon, Mail, Calendar, Ban } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getAvatarUrl, getUserInitials, getAvatarColor } from '@/lib/utils/avatar'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  created_at: string
  is_online?: boolean
}

interface UserCardProps {
  user: User
  isCurrentUser: boolean
  isAdmin: boolean
  onDelete: (id: string, name: string) => void
  onBlock: (id: string, name: string) => void
  index: number
}

export function UserCard({ user, isCurrentUser, isAdmin, onDelete, onBlock, index }: UserCardProps) {
  // ✅ Use avatar helper
  const avatarUrl = getAvatarUrl(user.id, user.avatar_url)
  const initials = getUserInitials(user.name)
  const avatarColor = getAvatarColor(user.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-lg"
    >
      {/* Online Indicator */}
      {user.is_online && (
        <div className="absolute right-4 top-4">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
        </div>
      )}

      {/* Avatar */}
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-4 ring-muted transition-all group-hover:ring-primary">
            <AvatarImage src={avatarUrl} alt={user.name} />
            <AvatarFallback className={`bg-gradient-to-br ${avatarColor} text-xl font-bold text-white`}>
              {initials}
            </AvatarFallback>
          </Avatar>

          {user.role === 'admin' && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="space-y-3 text-center">
        <div>
          <h3 className="text-lg font-bold text-card-foreground">
            {user.name}
            {isCurrentUser && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                You
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="truncate">{user.email}</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mt-4 flex justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            user.role === 'admin'
              ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {user.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
          {user.role}
        </span>
      </div>

      {/* Admin Actions */}
      {isAdmin && !isCurrentUser && (
        <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onBlock(user.id, user.name)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
          >
            <Ban className="h-3.5 w-3.5" />
            Block
          </button>
          <button
            onClick={() => onDelete(user.id, user.name)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </motion.div>
  )
}

// Empty State
export function EmptyUsers({ searchTerm }: { searchTerm?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted p-12"
    >
      <div className="mb-4 rounded-full bg-muted p-6">
        <UserIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-card-foreground">
        {searchTerm ? 'No users found' : 'No users yet'}
      </h3>
      <p className="text-muted-foreground">
        {searchTerm ? `No users match "${searchTerm}"` : 'Users will appear here once they register'}
      </p>
    </motion.div>
  )
}

// Loading Skeleton
export function UsersSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl border-2 border-border bg-muted"
        />
      ))}
    </div>
  )
}