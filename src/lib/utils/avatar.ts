// src/lib/utils/avatar.ts

/**
 * Get properly formatted avatar URL for a user
 * Handles all avatar_url formats and adds cache-busting timestamp
 */
export function getAvatarUrl(userId: string, avatarPath?: string | null): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
    const timestamp = Date.now()
    
    if (!avatarPath) {
      // Return endpoint that will serve default avatar
      return `${baseUrl}/api/v1/users/${userId}/avatar?t=${timestamp}`
    }
    
    // Handle different avatar_url formats from backend
    
    // Already a full HTTP URL
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return `${avatarPath}?t=${timestamp}`
    }
    
    // Already has /api/v1 prefix
    if (avatarPath.startsWith('/api/v1')) {
      return `${baseUrl}${avatarPath}?t=${timestamp}`
    }
    
    // Has /users prefix but missing /api/v1
    if (avatarPath.startsWith('/users')) {
      return `${baseUrl}/api/v1${avatarPath}?t=${timestamp}`
    }
    
    // Default: construct full path
    return `${baseUrl}/api/v1/users/${userId}/avatar?t=${timestamp}`
  }
  
  /**
   * Get user initials for avatar fallback
   */
  export function getUserInitials(name: string): string {
    if (!name) return '?'
    
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    
    return name.substring(0, 2).toUpperCase()
  }
  
  /**
   * Get color for avatar background based on user ID (consistent color per user)
   */
  export function getAvatarColor(userId: string): string {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-green-600',
      'from-amber-500 to-orange-600',
    ]
    
    // Use user ID to consistently pick a color
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }