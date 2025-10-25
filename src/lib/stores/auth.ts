// src/lib/stores/auth.ts

import { create } from 'zustand'
import type { User } from '@/types'
import { storage } from '@/lib/utils/storage'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    storage.clearTokens()
    set({ user: null, isAuthenticated: false })
  },
}))
