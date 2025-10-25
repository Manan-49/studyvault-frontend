'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Shield, Check, AlertCircle } from 'lucide-react'
import CustomInput from './custom-input'
import CustomButton from './custom-button'
import PasswordStrength from './password-strength'

interface SecurityCardProps {
  onPasswordChange: (data: {
    current_password: string
    new_password: string
  }) => Promise<void>
}

export default function SecurityCard({ onPasswordChange }: SecurityCardProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await onPasswordChange({
        current_password: currentPassword,
        new_password: newPassword,
      })
      
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false)
    }
  }

  const hasValue = currentPassword || newPassword || confirmPassword
  const isValid = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8

  return (
    <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Change your password</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-5">
          <CustomInput
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            icon={Lock}
            type="password"
            placeholder="Enter current password"
          />

          <div className="space-y-2">
            <CustomInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              icon={Lock}
              type="password"
              placeholder="Enter new password"
            />
            {newPassword && <PasswordStrength password={newPassword} />}
          </div>

          <CustomInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={Lock}
            type="password"
            placeholder="Confirm new password"
            error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
          />

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Action Button */}
          {hasValue && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-2"
            >
              <CustomButton
                onClick={handleSubmit}
                loading={loading}
                variant="primary"
                icon={Check}
                disabled={!isValid}
                className="w-full"
              >
                Update Password
              </CustomButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}