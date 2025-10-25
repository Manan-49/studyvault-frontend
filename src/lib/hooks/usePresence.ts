import { useEffect, useState } from 'react'
import { useSocket } from './useSocket'

export interface PresenceUser {
  id: string
  name: string
  avatar_url?: string
}

export const usePresence = (fileId?: string) => {
  const socket = useSocket()
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    if (!socket || !fileId) return

    // Join file presence room
    socket.emit('join_file', { file_id: fileId })

    // Listen for presence updates
    socket.on('presence_update', (data: { users: PresenceUser[] }) => {
      setActiveUsers(data.users || [])
    })

    return () => {
      socket.emit('leave_file', { file_id: fileId })
      socket.off('presence_update')
    }
  }, [socket, fileId])

  return { activeUsers, count: activeUsers.length }
}

export const useGlobalPresence = () => {
  const socket = useSocket()
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    if (!socket) return

    // Listen for global presence
    socket.on('global_presence', (data: { count: number }) => {
      setOnlineCount(data.count || 0)
    })

    // Request initial count
    socket.emit('get_online_count')

    return () => {
      socket.off('global_presence')
    }
  }, [socket])

  // ✅ MOCK: Return random online count for testing (remove when WebSocket is ready)
  useEffect(() => {
    const interval = setInterval(() => {
      if (socket?.connected) {
        // Real connection, wait for server
      } else {
        // Mock data for testing
        setOnlineCount(Math.floor(Math.random() * 10) + 1)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [socket])

  return { onlineCount }
}