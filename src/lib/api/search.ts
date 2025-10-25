// src/lib/api/search.ts

import { apiClient } from './client'

export interface SearchResultFile {
  id: string
  title: string
  filename: string
  size_bytes: number
  created_at: string
  ocr_status: string
  mime_type: string
  folder_id?: string
}

export interface SearchResultFolder {
  id: string
  name: string
  path: string
  created_at: string
  parent_id?: string
}

export interface SearchResultItem {
  type: 'file' | 'folder'
  score: number
  snippet?: string
  file?: SearchResultFile
  folder?: SearchResultFolder
}

export interface SearchResponse {
  items: SearchResultItem[]
  meta: {
    total: number
    page: number
    page_size: number
  }
  query: string
}

export const searchApi = {
  search: async (query: string, page = 1, pageSize = 20): Promise<SearchResponse> => {
    const response = await apiClient.get<SearchResponse>('/search', {
      params: {
        q: query,
        page,
        page_size: pageSize,
      },
    })
    return response.data
  },
}