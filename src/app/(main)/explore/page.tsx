// src/app/(main)/explore/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Upload as UploadIcon,
  Search,
  FolderPlus,
  Folder,
  FileText,
  AlertCircle,
  Loader2,
  MoreVertical,
  Trash2,
  Download,
  X,
  ChevronRight,
  Home,
  Eye,
  Image as ImageIcon,
  FileIcon,
} from 'lucide-react'
import { filesApi } from '@/lib/api/files'
import { foldersApi } from '@/lib/api/folders'
import { searchApi } from '@/lib/api/search'
import { formatBytes } from '@/lib/utils/format'
import { formatDistanceToNow } from 'date-fns'

interface FolderItem {
  id: string
  name: string
  path: string
  created_at: string
  parent_id?: string
}

interface FileItem {
  id: string
  title: string
  filename: string
  size_bytes: number
  created_at: string
  ocr_status: string
  mime_type: string
  folder_id?: string
}

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFolderId = searchParams.get('folder_id') || undefined

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null)
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<{
    files: FileItem[]
    folders: FolderItem[]
  } | null>(null)

  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({
    show: false,
    message: '',
    type: 'success',
  })

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [currentFolderData, foldersData, filesData] = await Promise.all([
        currentFolderId ? foldersApi.get(currentFolderId) : Promise.resolve(null),
        foldersApi.list({ page: 1, page_size: 100, parent_id: currentFolderId }),
        filesApi.list({ page: 1, page_size: 100, folder_id: currentFolderId }),
      ])

      setCurrentFolder(currentFolderData)
      setFolders(foldersData?.items || [])
      setFiles(filesData?.items || [])
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }, [currentFolderId])

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    try {
      const response = await searchApi.search(query, 1, 100)
      const searchFiles: FileItem[] = []
      const searchFolders: FolderItem[] = []

      response.items.forEach((item) => {
        if (item.type === 'file' && item.file) searchFiles.push(item.file)
        else if (item.type === 'folder' && item.folder) searchFolders.push(item.folder)
      })

      setSearchResults({ files: searchFiles, folders: searchFolders })
    } catch (err) {
      console.error('Search failed:', err)
      setSearchResults(null)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (debouncedSearch) performSearch(debouncedSearch)
    else setSearchResults(null)
  }, [debouncedSearch, performSearch])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      await foldersApi.create({ name: newFolderName, parent_id: currentFolderId })
      setShowCreateFolder(false)
      setNewFolderName('')
      fetchData()
      showToast('Folder created', 'success')
    } catch (err) {
      showToast('Failed to create folder', 'error')
    }
  }

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Delete this folder and all its contents?')) return
    try {
      await foldersApi.delete(id)
      fetchData()
      showToast('Folder deleted', 'success')
    } catch (err) {
      showToast('Failed to delete folder', 'error')
    }
  }

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return
    try {
      await filesApi.delete(id)
      fetchData()
      showToast('File deleted', 'success')
    } catch (err) {
      showToast('Failed to delete file', 'error')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadFiles.length === 0) return

    setUploading(true)
    let successCount = 0

    for (const file of uploadFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
        if (currentFolderId) formData.append('folder_id', currentFolderId)
        formData.append('ocr', 'true')
        await filesApi.upload(formData)
        successCount++
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    setUploading(false)
    setShowUpload(false)
    setUploadFiles([])
    fetchData()
    showToast(`Uploaded ${successCount} file(s)`, 'success')
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await filesApi.download(file.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      a.click()
      window.URL.revokeObjectURL(url)
      showToast('Download started', 'success')
    } catch (err) {
      showToast('Download failed', 'error')
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType === 'application/pdf') return FileText
    return FileIcon
  }

  const displayFolders = searchResults ? searchResults.folders : folders
  const displayFiles = searchResults ? searchResults.files : files

  const breadcrumbs = currentFolder ? currentFolder.path.split('/').filter(Boolean) : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed left-4 right-4 top-4 z-50 rounded-lg px-4 py-3 font-semibold text-white shadow-lg sm:left-auto sm:right-4 sm:w-auto ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b-2 border-border bg-card/95 backdrop-blur-sm">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">Explore</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {searchResults
                  ? `${displayFiles.length + displayFolders.length} results`
                  : 'Browse your study materials'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border bg-card hover:bg-accent sm:w-auto sm:gap-2 sm:px-4"
                aria-label="New Folder"
              >
                <FolderPlus className="h-5 w-5" />
                <span className="hidden sm:inline">Folder</span>
              </button>

              <button
                onClick={() => setShowUpload(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 sm:w-auto sm:gap-2 sm:px-4"
                aria-label="Upload"
              >
                <UploadIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          {!searchResults && breadcrumbs.length > 0 && (
            <div className="mb-3 flex items-center gap-1 overflow-x-auto text-sm">
              <button
                onClick={() => router.push('/explore')}
                className="flex items-center gap-1 whitespace-nowrap rounded px-2 py-1 hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                <span className="text-muted-foreground">Home</span>
              </button>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-1">
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="whitespace-nowrap font-medium text-foreground">{crumb}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files and folders..."
              className="h-11 w-full rounded-lg border-2 border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-4 text-red-600">{error}</p>
            </div>
          </div>
        ) : displayFolders.length === 0 && displayFiles.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="max-w-sm text-center">
              <Folder className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {searchResults ? 'No results found' : 'This folder is empty'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchResults
                  ? 'Try a different search term'
                  : 'Upload files or create folders to get started'}
              </p>
              {!searchResults && (
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="rounded-lg border-2 border-border px-4 py-2 font-medium hover:bg-accent"
                  >
                    Create Folder
                  </button>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    Upload Files
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders */}
            {displayFolders.length > 0 && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Folder className="h-4 w-4" />
                  Folders ({displayFolders.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className="group relative rounded-lg border-2 border-border bg-card p-4 transition-all hover:border-blue-500 hover:shadow-md active:scale-98"
                      onClick={() => {
                        setSearchTerm('')
                        setSearchResults(null)
                        router.push(`/explore?folder_id=${folder.id}`)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <Folder className="h-10 w-10 text-blue-500" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowActionMenu(showActionMenu === folder.id ? null : folder.id)
                          }}
                          className="rounded p-1 opacity-0 hover:bg-accent group-hover:opacity-100"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                      <h3 className="mt-3 truncate font-semibold text-foreground">{folder.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}
                      </p>

                      {/* Action Menu */}
                      {showActionMenu === folder.id && (
                        <div className="absolute right-2 top-14 z-10 w-40 rounded-lg border-2 border-border bg-card shadow-xl">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFolder(folder.id)
                              setShowActionMenu(null)
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {displayFiles.length > 0 && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Files ({displayFiles.length})
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayFiles.map((file) => {
                    const Icon = getFileIcon(file.mime_type)
                    return (
                      <div
                        key={file.id}
                        className="group relative rounded-lg border-2 border-border bg-card p-4 transition-all hover:border-blue-500 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowActionMenu(showActionMenu === file.id ? null : file.id)
                            }}
                            className="rounded p-1 opacity-0 hover:bg-accent group-hover:opacity-100"
                            aria-label="More options"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>

                        <h3 className="mt-3 truncate font-semibold text-foreground" title={file.title}>
                          {file.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatBytes(file.size_bytes)} •{' '}
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </p>

                        <button
                          onClick={() => router.push(`/explore/${file.id}`)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95"
                        >
                          <Eye className="h-4 w-4" />
                          Open
                        </button>

                        {/* Action Menu */}
                        {showActionMenu === file.id && (
                          <div className="absolute right-2 top-14 z-10 w-40 rounded-lg border-2 border-border bg-card shadow-xl">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(file)
                                setShowActionMenu(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-t-lg px-4 py-2 text-sm hover:bg-accent"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteFile(file.id)
                                setShowActionMenu(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-b-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <AnimatePresence>
        {showCreateFolder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateFolder(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-4 right-4 top-1/2 z-50 max-w-md -translate-y-1/2 rounded-2xl border-2 border-border bg-card p-6 shadow-2xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Create Folder</h2>
                <button
                  onClick={() => setShowCreateFolder(false)}
                  className="rounded-lg p-1 hover:bg-accent"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder}>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  autoFocus
                  className="h-12 w-full rounded-lg border-2 border-border bg-background px-4 text-sm outline-none focus:border-blue-500"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateFolder(false)}
                    className="rounded-lg border-2 border-border px-4 py-2 font-medium hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newFolderName.trim()}
                    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upload Dialog */}
      <AnimatePresence>
        {showUpload && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setShowUpload(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-4 right-4 top-1/2 z-50 max-w-lg -translate-y-1/2 rounded-2xl border-2 border-border bg-card p-6 shadow-2xl sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Upload Files</h2>
                {!uploading && (
                  <button
                    onClick={() => setShowUpload(false)}
                    className="rounded-lg p-1 hover:bg-accent"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleUpload}>
                <div className="rounded-lg border-2 border-dashed border-border bg-muted p-8 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {uploadFiles.length > 0
                      ? `${uploadFiles.length} file(s) selected`
                      : 'Choose files to upload'}
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                    className="mt-4"
                  />
                </div>

                {uploadFiles.length > 0 && (
                  <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
                    {Array.from(uploadFiles).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-muted p-2 text-sm"
                      >
                        <span className="truncate">{file.name}</span>
                        <span className="ml-2 flex-shrink-0 text-muted-foreground">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    disabled={uploading}
                    className="rounded-lg border-2 border-border px-4 py-2 font-medium hover:bg-accent disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadFiles.length === 0 || uploading}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}