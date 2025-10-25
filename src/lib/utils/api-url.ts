// src/lib/utils/api-url.ts

/**
 * Constructs a full API URL from a relative path
 * Handles both /api/v1/... and /... paths
 */
export function buildApiUrl(path: string): string {
  if (!path) return ''
  
  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  
  // Path already includes /api/v1
  if (path.startsWith('/api/v1/')) {
    // Remove /api/v1 from baseUrl and append full path
    const base = baseUrl.replace(/\/api\/v1\/?$/, '')
    return `${base}${path}`
  }
  
  // Path is relative (e.g., /files/123/thumbnail)
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`
  }
  
  // No leading slash
  return `${baseUrl}/${path}`
}