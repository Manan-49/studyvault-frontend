'use client'

import { motion } from 'framer-motion'
import { Camera, Calendar, Mail, Shield } from 'lucide-react'

interface ProfileSidebarProps {
  user: any
  avatarUrl?: string
  onAvatarClick: () => void
}

export default function ProfileSidebar({
  user,
  avatarUrl,
  onAvatarClick,
}: ProfileSidebarProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="sticky top-8 space-y-6">
      {/* Avatar & Basic Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="relative">
                {/* Gradient Ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-75 transition-opacity" />
                
                {/* Avatar */}
                <div className="relative h-32 w-32 rounded-full bg-white dark:bg-slate-700 p-1">
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
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="h-8 w-8 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* User Info */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200 dark:border-slate-700" />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
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
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">Account Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Files</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Notes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
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