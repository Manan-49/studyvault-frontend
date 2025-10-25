// src/lib/utils/storage.ts

import Cookies from 'js-cookie'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const storage = {
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_KEY, accessToken, {
      expires: 1 / 96, // 15 minutes
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    Cookies.set(REFRESH_KEY, refreshToken, {
      expires: 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  },

  getAccessToken: (): string | undefined => {
    return Cookies.get(ACCESS_KEY)
  },

  getRefreshToken: (): string | undefined => {
    return Cookies.get(REFRESH_KEY)
  },

  clearTokens: () => {
    Cookies.remove(ACCESS_KEY)
    Cookies.remove(REFRESH_KEY)
  },
}
