import { apiClient } from './client'
import type { Folder, PaginatedResponse } from '@/types'

export const foldersApi = {
  list: async (params?: { page?: number; page_size?: number; parent_id?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Folder>>('/folders', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<Folder>(`/folders/${id}`)
    return response.data
  },

  create: async (data: { name: string; parent_id?: string }) => {
    const response = await apiClient.post<Folder>('/folders', data)
    return response.data
  },

  update: async (id: string, data: { name?: string; parent_id?: string }) => {
    const response = await apiClient.put<Folder>(`/folders/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ deleted: boolean }>(`/folders/${id}`)
    return response.data
  },
}