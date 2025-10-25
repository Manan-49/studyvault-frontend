import { apiClient } from './client'
import type { Activity, PaginatedResponse } from '@/types'

interface ActivityFilters {
  page?: number
  page_size?: number
  type?: string
  user_id?: string
  file_id?: string
  date_from?: string
  date_to?: string
}

export const activityApi = {
  list: async (filters?: ActivityFilters) => {
    const response = await apiClient.get<PaginatedResponse<Activity>>('/activity', {
      params: filters,
    })
    return response.data
  },

  exportCSV: async () => {
    const response = await apiClient.get('/activity/export', {
      params: { format: 'csv' },
      responseType: 'blob',
    })
    return response.data
  },
}