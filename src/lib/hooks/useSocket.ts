import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { storage } from '@/lib/utils/storage'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = storage.getAccessToken()
    if (!token) return

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', {
      path: '/api/v1/ws/notifications', // ✅ Your original path
      transports: ['websocket', 'polling'],
      auth: { token },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return socketRef.current
}