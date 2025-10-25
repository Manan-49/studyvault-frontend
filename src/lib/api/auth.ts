// src/lib/api/auth.ts

import { apiClient } from './client'
import type { User, Tokens } from '@/types'

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await apiClient.post<{ user: User; tokens: Tokens }>('/auth/register', data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post<{ user: User; tokens: Tokens }>('/auth/login', data)
    return response.data
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<{ tokens: Tokens }>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  getMe: async () => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await apiClient.put<User>('/auth/me/update', data)
    return response.data
  },

  changePassword: async (data: { current_password: string; new_password: string }) => {
    const response = await apiClient.put<{ message: string }>('/auth/me/password', data)
    return response.data
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<{ avatar_url: string }>('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}