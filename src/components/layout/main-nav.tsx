// src/components/layout/main-nav.tsx

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'
import {
  LayoutDashboard,
  FolderOpen,
  StickyNote,
  Activity,
  Users,
  LogOut,
  Shield,
  Moon,
  Sun,
} from 'lucide-react'
import { storage } from '@/lib/utils/storage'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function MainNav() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [isDark, setIsDark] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Mount client-side immediately
  useEffect(() => {
    setIsClient(true)
    // Check theme
    const theme = localStorage.getItem('studyvault-theme')
    setIsDark(theme === 'dark')
  }, [])

  // Load avatar with auth token
  useEffect(() => {
    if (!user?.avatar_url || !isClient) return

    const loadAvatar = async () => {
      try {
        const token = storage.getAccessToken()
        const avatarUrl = user?.avatar_url?.startsWith('http')
          ? user.avatar_url
          : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar_url}`

        const response = await fetch(avatarUrl, {
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
  }, [user?.avatar_url, isClient])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore', href: '/explore', icon: FolderOpen },
    { name: 'Notes', href: '/notes', icon: StickyNote },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'Users', href: '/users', icon: Users },
  ]

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('studyvault-theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('studyvault-theme', 'dark')
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const isAdmin = user?.role === 'admin'

  return (
    <>
      {/* Desktop & Mobile Top Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            {/* Logo & Desktop Navigation */}
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                {/* ✅ Logo Image */}
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg shadow-lg sm:h-10 sm:w-10">
                  <Image
                    src="/icon-192.png"
                    alt="StudyVault"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
                <span className="hidden text-lg font-bold text-gray-900 dark:text-white sm:block sm:text-xl">
                  StudyVault
                </span>
              </Link>

              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden space-x-1 md:flex">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  return (
                    <Link key={item.name} href={item.href}>
                      <button
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden lg:inline">{item.name}</span>
                      </button>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side - Theme Toggle, Avatar, Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              {isClient && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isDark ? 'dark' : 'light'}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isDark ? (
                        <Moon className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Sun className="h-4 w-4 text-orange-500" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Profile */}
              <Link href="/profile">
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 sm:px-3 sm:py-2">
                  <div className="relative flex-shrink-0">
                    <div className="h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 sm:h-8 sm:w-8">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white sm:text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 p-0.5 shadow-md">
                        <Shield className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
                      </div>
                    )}
                  </div>
                  <span className="hidden truncate sm:inline">{user?.name}</span>
                </button>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[100] w-full border-t border-gray-200 bg-white/95 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/95 md:hidden"
        style={{ WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-5 px-2 py-1 safe-area-inset-bottom">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link key={item.name} href={item.href} className="flex justify-center">
                <button
                  className={`relative flex w-full max-w-[80px] flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'drop-shadow-lg' : ''}`} />
                  <span className="text-[10px] font-medium leading-tight">{item.name}</span>
                  {isActive && isClient && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 h-0.5 w-12 rounded-full bg-blue-600 dark:bg-blue-400"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}