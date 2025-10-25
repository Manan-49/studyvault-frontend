// src/types/index.ts

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  created_at: string
  avatar_url?: string
  is_online?: boolean
}

export interface Tokens {
  access: string
  refresh: string
  expires_in: number
}

export interface File {
  id: string
  title: string
  filename: string
  mime_type: string
  size_bytes: number
  folder_id?: string
  uploader_id: string
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed'
  ocr_lang?: string
  pages?: number
  thumbnail_url?: string
  download_url: string
  text_indexed: boolean
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  name: string
  parent_id?: string
  path: string
  created_at: string
  updated_at: string
}

export interface SearchItem {
  type: 'file' | 'folder'
  score: number
  snippet?: string
  file?: File
  folder?: Folder
}

export interface Activity {
  id: string
  type: string
  user_id: string
  user_name: string
  file_id?: string
  note_id?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface Stats {
  files_total: number
  users_total: number
  active_users: number
  storage_used_bytes: number
  storage_used_mb: number
  storage_quota_bytes: number
}

export interface PaginationMeta {
  page: number
  page_size: number
  total: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export interface SearchResponse {
  query: string
  items: SearchItem[]
  meta: PaginationMeta
}

export interface ErrorResponse {
  error: string
  message: string
}

export interface PresenceUser {
  id: string
  name: string
  avatar_url?: string
}

export type SortOption = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'size-asc' | 'size-desc'