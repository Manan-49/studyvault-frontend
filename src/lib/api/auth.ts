// src/lib/api/auth.ts

import { apiClient } from './client'
import type { User, Tokens } from '@/types'

export interface LoginRequest {
  email?: string
  email_or_username?: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface Session {
  id: string
  device: string
  ip: string | null
  user_agent: string | null
  created_at: string
  last_seen_at: string
  current: boolean
}

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<{ user: User; tokens: Tokens }>('/auth/register', data)
    return response.data
  },

  // Login user
  login: async (data: LoginRequest) => {
    const response = await apiClient.post<{ user: User; tokens: Tokens }>('/auth/login', data)
    return response.data
  },

  // Refresh access token
  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<{ tokens: Tokens }>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // Get current user
  getMe: async () => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  // Update profile (name/email)
  updateProfile: async (data: UpdateProfileRequest) => {
    const response = await apiClient.put<User>('/auth/me/update', data)
    return response.data
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await apiClient.put<{ message: string }>('/auth/me/password', data)
    return response.data
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post<{ 
      avatar_url: string
      message: string 
    }>('/auth/me/avatar', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    })
    return response.data
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await apiClient.delete<{ message: string }>('/auth/me/avatar')
    return response.data
  },

  // Get user sessions
  getSessions: async (params?: { page?: number; page_size?: number }) => {
    const response = await apiClient.get<{
      items: Session[]
      meta: {
        page: number
        page_size: number
        total: number
      }
    }>('/auth/sessions', { params })
    return response.data
  },

  // Revoke all sessions (logout everywhere)
  revokeAllSessions: async () => {
    const response = await apiClient.post<{ message: string }>('/auth/sessions/revoke_all')
    return response.data
  },
}