import { apiClient } from './client'
import type { File, PaginatedResponse } from '@/types'

export const filesApi = {
  list: async (params?: { page?: number; page_size?: number; folder_id?: string; q?: string }) => {
    const response = await apiClient.get<PaginatedResponse<File>>('/files', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<File>(`/files/${id}`)
    return response.data
  },

  upload: async (formData: FormData) => {
    const response = await apiClient.post<File>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id: string, data: { title?: string; folder_id?: string | null }) => {
    const response = await apiClient.put<File>(`/files/${id}/update`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ deleted: boolean }>(`/files/${id}/delete`)
    return response.data
  },

  download: async (id: string) => {
    const response = await apiClient.get(`/files/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  getThumbnailUrl: (id: string) => {
    return `${apiClient.defaults.baseURL}/files/${id}/thumbnail`
  },

  // ✅ NEW: Regenerate thumbnail
  regenerateThumbnail: async (id: string) => {
    const response = await apiClient.post<{ message: string; task_id: string }>(
      `/files/${id}/regenerate-thumbnail`
    )
    return response.data
  },

  // ✅ NEW: Regenerate all thumbnails (admin)
  regenerateAllThumbnails: async () => {
    const response = await apiClient.post<{ message: string; queued: number }>(
      '/files/regenerate-all-thumbnails'
    )
    return response.data
  },
}