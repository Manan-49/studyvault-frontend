'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Check, X } from 'lucide-react'
import CustomInput from './custom-input'
import CustomButton from './custom-button'

interface ProfileInfoCardProps {
  initialName: string
  initialEmail: string
  onSave: (data: { name: string; email: string }) => Promise<void>
}

export default function ProfileInfoCard({
  initialName,
  initialEmail,
  onSave,
}: ProfileInfoCardProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    setHasChanges(value !== initialName || email !== initialEmail)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setHasChanges(name !== initialName || value !== initialEmail)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave({ name, email })
      setHasChanges(false)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setName(initialName)
    setEmail(initialEmail)
    setHasChanges(false)
  }

  return (
    <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Update your personal details</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-5">
          <CustomInput
            label="Full Name"
            value={name}
            onChange={handleNameChange}
            icon={User}
            placeholder="Enter your name"
          />

          <CustomInput
            label="Email Address"
            value={email}
            onChange={handleEmailChange}
            icon={Mail}
            type="email"
            placeholder="Enter your email"
          />

          {/* Action Buttons */}
          {hasChanges ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3 pt-2"
            >
              <CustomButton
                onClick={handleSave}
                loading={loading}
                variant="primary"
                icon={Check}
                className="flex-1"
              >
                Save Changes
              </CustomButton>
              <CustomButton
                onClick={handleReset}
                variant="secondary"
                icon={X}
                disabled={loading}
              >
                Cancel
              </CustomButton>
            </motion.div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-2">
              <Check className="h-4 w-4 text-green-500" />
              Profile is up to date
            </div>
          )}
        </div>
      </div>
    </div>
  )
}