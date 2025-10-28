'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth'
import ProfileSidebar from '@/components/profile/profile-sidebar'
import ProfileInfoCard from '@/components/profile/profile-info-card'
import SecurityCard from '@/components/profile/security-card'
import AvatarUploadModal from '@/components/profile/avatar-upload-modal'
import Toast from '@/components/profile/toast'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  
  const [mounted, setMounted] = useState(false)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleProfileUpdate = async (data: { name: string; email: string }) => {
    try {
      const updatedUser = await authApi.updateProfile(data)
      setUser(updatedUser)
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast('Failed to update profile', 'error')
    }
  }

  const handlePasswordChange = async (data: {
    current_password: string
    new_password: string
  }) => {
    try {
      await authApi.changePassword(data)
      showToast('Password changed successfully', 'success')
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Failed to change password',
        'error'
      )
    }
  }

  const handleAvatarSuccess = async () => {
    try {
      // ✅ Fetch fresh user data with new avatar URL
      const updatedUser = await authApi.getMe()
      setUser(updatedUser)
      
      showToast('Avatar updated successfully', 'success')
      
      // ✅ Force refresh after short delay to show new avatar
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      showToast('Failed to update avatar', 'error')
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <div className="bg-card border-b border-border transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Pass user directly, let ProfileSidebar handle avatar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <ProfileSidebar
              user={user}
              onAvatarClick={() => setAvatarModalOpen(true)}
            />
          </motion.div>

          {/* Main Settings */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProfileInfoCard
                initialName={user?.name || ''}
                initialEmail={user?.email || ''}
                onSave={handleProfileUpdate}
              />
            </motion.div>

            {/* Security & Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SecurityCard onPasswordChange={handlePasswordChange} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSuccess={handleAvatarSuccess}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}