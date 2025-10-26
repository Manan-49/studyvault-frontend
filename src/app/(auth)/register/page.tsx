// src/app/(auth)/register/page.tsx

'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, User } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { storage } from '@/lib/utils/storage'
import { useAuthStore } from '@/lib/stores/auth'
import { FloatingInput } from '@/components/auth/floating-input'
import { PasswordInput } from '@/components/auth/password-input'
import { ConfirmPasswordInput } from '@/components/auth/confirm-password-input'
import { GradientButton } from '@/components/auth/gradient-button'
import { BackgroundDecoration } from '@/components/auth/background-decoration'
import { Toast } from '@/components/auth/toast-notification'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  // Validation State
  const [isNameValid, setIsNameValid] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(false)

  // Auto-focus name input on mount
  useEffect(() => {
    const nameInput = document.getElementById('name') as HTMLInputElement
    nameInput?.focus()
  }, [])

  // Real-time name validation
  useEffect(() => {
    if (name.length > 0) {
      setIsNameValid(name.length >= 2)
      if (errors.name) {
        setErrors((prev) => ({ ...prev, name: undefined }))
      }
    } else {
      setIsNameValid(false)
    }
  }, [name, errors.name])

  // Real-time email validation
  useEffect(() => {
    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      setIsEmailValid(emailRegex.test(email))
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: undefined }))
      }
    } else {
      setIsEmailValid(false)
    }
  }, [email, errors.email])

  // Real-time password validation
  useEffect(() => {
    if (password.length > 0) {
      setIsPasswordValid(password.length >= 6)
      if (errors.password) {
        setErrors((prev) => ({ ...prev, password: undefined }))
      }
    } else {
      setIsPasswordValid(false)
    }
  }, [password, errors.password])

  // Real-time password match validation
  useEffect(() => {
    if (confirmPassword.length > 0 && password.length > 0) {
      setPasswordsMatch(password === confirmPassword)
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      }
    } else {
      setPasswordsMatch(false)
    }
  }, [password, confirmPassword, errors.confirmPassword])

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name) {
      newErrors.name = 'Name is required'
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      const response = await authApi.register({ name, email, password })

      // Store tokens and user
      storage.setTokens(response.tokens.access, response.tokens.refresh)
      setUser(response.user)

      // Show success toast
      setToast({
        show: true,
        message: 'Account created! Welcome aboard! 🎉',
        type: 'success',
      })

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (error: any) {
      console.error('Registration error:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create account. Please try again.'

      setToast({
        show: true,
        message: errorMessage,
        type: 'error',
      })

      // Shake animation on inputs
      setErrors({
        name: ' ',
        email: ' ',
        password: ' ',
        confirmPassword: ' ',
      })

      setTimeout(() => {
        setErrors({})
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 dark:from-gray-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Animated Background */}
      <BackgroundDecoration />

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glassmorphic Card */}
        <div className="overflow-hidden rounded-3xl borderborder-border/50 bg-card/80 shadow-2xl backdrop-blur-xl">
          {/* Card Content */}
          <div className="p-8 sm:p-10">
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8 text-center"
            >
              {/* ✅ Logo Image */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-lg"
              >
                <Image
                  src="/icon-192.png"
                  alt="StudyVault Logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-foreground"
              >
                Create Account
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-2 text-sm text-muted-foreground"
              >
                Join StudyVault and start organizing
              </motion.p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <FloatingInput
                  id="name"
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  isValid={isNameValid}
                  icon={<User className="h-5 w-5" />}
                  autoComplete="name"
                  disabled={isLoading}
                />
              </motion.div>

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <FloatingInput
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  isValid={isEmailValid}
                  icon={<Mail className="h-5 w-5" />}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  isValid={isPasswordValid}
                  autoComplete="new-password"
                />
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <ConfirmPasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  isValid={confirmPassword.length >= 6}
                  passwordMatch={passwordsMatch}
                  autoComplete="new-password"
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <GradientButton
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="mt-2"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </GradientButton>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-1 font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-center text-xs text-muted-foreground"
        >
          Secure registration powered by StudyVault
        </motion.div>
      </motion.div>
    </div>
  )
}