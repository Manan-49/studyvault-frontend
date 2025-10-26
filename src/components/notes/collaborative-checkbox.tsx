'use client'

import { motion } from 'framer-motion'
import { Check, User } from 'lucide-react'
import { CheckboxUser } from '@/lib/api/notes'

interface CollaborativeCheckboxProps {
  checked: boolean
  users: CheckboxUser[]
  currentUserId?: string
  onToggle: () => void
  disabled?: boolean
}

export function CollaborativeCheckbox({
  checked,
  users,
  currentUserId,
  onToggle,
  disabled = false,
}: CollaborativeCheckboxProps) {
  const currentUserChecked = users.some((u) => u.user_id === currentUserId && u.checked)
  const otherUsers = users.filter((u) => u.user_id !== currentUserId && u.checked)

  return (
    <div className="flex items-center gap-2">
      {/* Checkbox */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={onToggle}
        disabled={disabled}
        className={`relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
          currentUserChecked
            ? 'border-blue-600 bg-blue-600'
            : 'border-gray-300 bg-white hover:border-blue-400 dark:border-gray-600 dark:bg-gray-800'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {currentUserChecked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>

      {/* User Avatars */}
      {otherUsers.length > 0 && (
        <div className="flex -space-x-2">
          {otherUsers.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
              title={user.user_name}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.user_name}
                  className="h-6 w-6 rounded-full border-2 border-white object-cover dark:border-gray-900"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white dark:border-gray-900">
                  {user.user_name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                {user.user_name}
                <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
              </div>
            </motion.div>
          ))}

          {otherUsers.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs font-bold text-gray-700 dark:border-gray-900 dark:bg-gray-600 dark:text-gray-200">
              +{otherUsers.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  )
}