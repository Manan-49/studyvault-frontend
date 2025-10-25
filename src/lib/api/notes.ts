import { apiClient } from './client'
import type { PaginatedResponse } from '@/types'

export interface Note {
  id: string
  title: string
  content: Record<string, any>
  folder_id?: string
  owner_id: string
  is_public: boolean
  created_at: string
  updated_at: string
  checkboxes: Record<string, CheckboxUser[]>
}

export interface CheckboxUser {
  user_id: string
  user_name: string
  checked: boolean
  checked_at: string
}

export interface NoteCreate {
  title: string
  content?: Record<string, any>
  folder_id?: string
  is_public?: boolean
}

export interface NoteUpdate {
  title?: string
  content?: Record<string, any>
  folder_id?: string
  is_public?: boolean
}

export const notesApi = {
  list: async (params?: { page?: number; page_size?: number; folder_id?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Note>>('/notes', { params })
    return response.data
  },

  get: async (id: string) => {
    const response = await apiClient.get<Note>(`/notes/${id}`)
    return response.data
  },

  create: async (data: NoteCreate) => {
    const response = await apiClient.post<Note>('/notes', data)
    return response.data
  },

  update: async (id: string, data: NoteUpdate) => {
    const response = await apiClient.put<Note>(`/notes/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ deleted: boolean }>(`/notes/${id}`)
    return response.data
  },

  toggleCheckbox: async (noteId: string, checkboxId: string, checked: boolean) => {
    const response = await apiClient.post<Note>(`/notes/${noteId}/checkbox`, {
      checkbox_id: checkboxId,
      checked,
    })
    return response.data
  },
}