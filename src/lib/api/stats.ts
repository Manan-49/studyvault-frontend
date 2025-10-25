import { apiClient } from './client'
import type { Stats } from '@/types'

export const statsApi = {
  get: async () => {
    const response = await apiClient.get<Stats>('/stats')
    return response.data
  },
}
