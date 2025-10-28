// src/components/profile/password-strength.tsx
'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Contains uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /[0-9]/.test(password) },
  ]

  const strength = requirements.filter((r) => r.test).length
  const percentage = (strength / requirements.length) * 100

  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-orange-500'
    if (strength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthLabel = () => {
    if (strength <= 1) return 'Weak'
    if (strength <= 2) return 'Fair'
    if (strength <= 3) return 'Good'
    return 'Strong'
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Password Strength</span>
          <span className={`text-xs font-semibold ${
            strength <= 1 ? 'text-red-600' :
            strength <= 2 ? 'text-orange-600' :
            strength <= 3 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
            className={`h-full ${getStrengthColor()} transition-colors`}
          />
        </div>
      </div>

      <div className="space-y-2">
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 text-xs"
          >
            {req.test ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-300" />
            )}
            <span className={req.test ? 'text-green-700' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}