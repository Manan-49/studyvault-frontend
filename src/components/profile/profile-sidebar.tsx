'use client'

import { motion } from 'framer-motion'
import { Camera, Calendar, Mail, Shield } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getAvatarUrl, getUserInitials, getAvatarColor } from '@/lib/utils/avatar'

interface ProfileSidebarProps {
  user: any
  onAvatarClick: () => void
}

export default function ProfileSidebar({
  user,
  onAvatarClick,
}: ProfileSidebarProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // ✅ Use avatar helper
  const avatarUrl = user?.id ? getAvatarUrl(user.id, user.avatar_url) : undefined
  const initials = getUserInitials(user?.name || '')
  const avatarColor = user?.id ? getAvatarColor(user.id) : 'from-blue-500 to-purple-600'

  return (
    <div className="sticky top-8 space-y-6">
      {/* Avatar & Basic Info */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card transition-colors">
        <div className="p-6">
          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="group relative"
            >
              <div className="relative">
                {/* Gradient Ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-25 blur transition-opacity group-hover:opacity-75" />

                {/* Avatar Container */}
                <div className="relative h-32 w-32 rounded-full bg-card p-1">
                  <Avatar className="h-full w-full">
                    <AvatarImage 
                      key={avatarUrl} 
                      src={avatarUrl} 
                      alt={user?.name} 
                    />
                    <AvatarFallback className={`bg-gradient-to-br ${avatarColor} text-4xl font-bold text-white`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Upload Overlay */}
                <motion.button
                  onClick={onAvatarClick}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Change avatar"
                >
                  <Camera className="h-8 w-8 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* User Info */}
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200 dark:border-slate-700" />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/30">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Member Since</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatDate(user?.created_at || new Date().toISOString())}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/30">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Account Status</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 dark:border-slate-700 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Files</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Notes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-lg bg-card/20 p-2 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-semibold">Account Security</h3>
        </div>
        <p className="text-sm text-blue-100">
          Your account is protected with industry-standard encryption and security measures.
        </p>
      </div>
    </div>
  )
}