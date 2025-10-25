// src/lib/api/client.ts

import axios, { AxiosError } from 'axios'
import { storage } from '@/lib/utils/storage'

// ✅ FIXED: Add /api/v1 suffix if not present
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // ✅ Skip ngrok warning
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string }>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = storage.getRefreshToken()
      if (!refreshToken) {
        storage.clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        storage.setTokens(data.tokens.access, data.tokens.refresh)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.tokens.access}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        storage.clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)