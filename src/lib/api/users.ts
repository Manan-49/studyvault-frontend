import { apiClient } from './client'
import type { User, PaginatedResponse } from '@/types'

export const usersApi = {
  list: async (params?: { page?: number; page_size?: number; q?: string }) => {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ deleted: boolean }>(`/users/${id}`)
    return response.data
  },

  block: async (id: string) => {
    const response = await apiClient.post<{ blocked: boolean }>(`/users/${id}/block`)
    return response.data
  },

  getAvatarUrl: (id: string) => {
    return `${apiClient.defaults.baseURL}/users/${id}/avatar`
  },
}