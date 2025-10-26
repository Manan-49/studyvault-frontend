'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Users as UsersIcon } from 'lucide-react'
import { usersApi } from '@/lib/api/users'
import { useAuthStore } from '@/lib/stores/auth'
import { useGlobalPresence } from '@/lib/hooks/usePresence'
import { UserCard, EmptyUsers, UsersSkeleton } from '@/components/users/user-card'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  created_at: string
  is_online?: boolean
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const { onlineCount } = useGlobalPresence()
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const isAdmin = currentUser?.role === 'admin'

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await usersApi.list({ 
        page, 
        page_size: 20, 
        q: searchQuery 
      })
      setUsers(data.items || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Delete user
  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This cannot be undone.`)) {
      return
    }

    try {
      await usersApi.delete(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  // Block user
  const handleBlock = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to block "${userName}"?`)) {
      return
    }

    try {
      await usersApi.block(userId)
      await fetchUsers() // Refresh list
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  // Filter users by search
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              👥 Users
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isAdmin ? 'Manage all registered users' : 'View all registered users'}
            </p>
          </div>

          {/* Online Count Badge */}
          {onlineCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 dark:bg-green-900/30"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                {onlineCount} online
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name, email, or role..."
          className="h-12 w-full rounded-xl border-2 border-border bg-background pl-12 pr-12 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 text-foreground"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </motion.div>

      {/* Users Grid */}
      {loading ? (
        <UsersSkeleton />
      ) : filteredUsers.length === 0 ? (
        <EmptyUsers searchTerm={searchQuery} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser?.id}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onBlock={handleBlock}
              index={index}
            />
          ))}
        </motion.div>
      )}

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <UsersIcon className="h-4 w-4" />
        <span>
          Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
          {searchQuery && ' matching your search'}
        </span>
      </motion.div>
    </div>
  )
}