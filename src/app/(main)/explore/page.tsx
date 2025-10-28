'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Upload as UploadIcon, Search, FolderOpen, FileText, AlertCircle } from 'lucide-react'
import { filesApi } from '@/lib/api/files'
import { foldersApi } from '@/lib/api/folders'
import { searchApi } from '@/lib/api/search'
import { EnhancedBreadcrumb } from '@/components/explore/enhanced-breadcrumb'
import { FolderCardEnhanced } from '@/components/explore/folder-card-enhanced'
import { EmptyState } from '@/components/explore/empty-state'
import { CreateFolderDialog } from '@/components/explore/create-folder-dialog'
import { UploadDialogEnhanced } from '@/components/explore/upload-dialog-enhanced'
import { ToastSimple } from '@/components/explore/toast-simple'
import { formatBytes } from '@/lib/utils/format'
import { formatDistanceToNow } from 'date-fns'
import type { SortOption } from '@/types'

interface Folder {
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
  thumbnail_url?: string
  folder_id?: string
}

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFolderId = searchParams.get('folder_id') || undefined

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [allFolders, setAllFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    files: FileItem[]
    folders: Folder[]
    total: number
  } | null>(null)

  // Dialog states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [currentFolderData, foldersData, filesData, allFoldersData] = await Promise.all([
        currentFolderId ? foldersApi.get(currentFolderId) : Promise.resolve(null),
        foldersApi.list({ page: 1, page_size: 100, parent_id: currentFolderId }),
        filesApi.list({ page: 1, page_size: 100, folder_id: currentFolderId }),
        foldersApi.list({ page: 1, page_size: 100 }),
      ])

      setCurrentFolder(currentFolderData)
      setFolders(foldersData?.items || [])
      setFiles(filesData?.items || [])
      setAllFolders(allFoldersData?.items || [])
      
      // Auto-select first file if none selected
      if (!selectedFile && filesData?.items?.length > 0) {
        setSelectedFile(filesData.items[0])
      }
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load files and folders')
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }, [currentFolderId])

  // Perform OCR search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    try {
      setIsSearching(true)
      const response = await searchApi.search(query, 1, 100)

      const searchFiles: FileItem[] = []
      const searchFolders: Folder[] = []

      response.items.forEach((item) => {
        if (item.type === 'file' && item.file) searchFiles.push(item.file)
        else if (item.type === 'folder' && item.folder) searchFolders.push(item.folder)
      })

      setSearchResults({ files: searchFiles, folders: searchFolders, total: response.meta.total })
    } catch (err) {
      console.error('Search failed:', err)
      showToast('Search failed', 'error')
      setSearchResults(null)
    } finally {
      setIsSearching(false)
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
  }

  const handleCreateFolder = async (name: string) => {
    setIsCreatingFolder(true)
    try {
      await foldersApi.create({ name, parent_id: currentFolderId })
      await fetchData()
      setIsCreateFolderOpen(false)
      showToast('Folder created successfully', 'success')
    } catch (err) {
      showToast('Failed to create folder', 'error')
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Delete this folder and all its contents?')) return
    try {
      await foldersApi.delete(id)
      await fetchData()
      showToast('Folder deleted successfully', 'success')
    } catch (err) {
      showToast('Failed to delete folder', 'error')
    }
  }

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return
    try {
      await filesApi.delete(id)
      if (selectedFile?.id === id) setSelectedFile(null)
      await fetchData()
      showToast('File deleted successfully', 'success')
    } catch (err) {
      showToast('Failed to delete file', 'error')
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await filesApi.download(file.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showToast('Download started', 'success')
    } catch (err) {
      showToast('Download failed', 'error')
    }
  }

  const handleUpload = async (uploadFiles: File[]) => {
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
    await fetchData()
    showToast(`Successfully uploaded ${successCount} file(s)`, 'success')
  }

  const displayFolders = searchResults ? searchResults.folders : folders
  const displayFiles = searchResults ? searchResults.files : files

  const breadcrumbs = currentFolder ? currentFolder.path.split('/').filter(Boolean) : []
  const isShowingSearchResults = Boolean(searchResults)
  const isAtRoot = !currentFolderId

  // Sort files
  let sortedFiles = [...displayFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.title.localeCompare(b.title)
      case 'name-desc': return b.title.localeCompare(a.title)
      case 'date-asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'date-desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'size-asc': return a.size_bytes - b.size_bytes
      case 'size-desc': return b.size_bytes - a.size_bytes
      default: return 0
    }
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col gap-4 pb-4">
      <ToastSimple show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Explore</h1>
          <p className="text-sm text-muted-foreground">
            {isShowingSearchResults ? `${searchResults?.total || 0} results for "${debouncedSearch}"` : 'Browse your study materials'}
          </p>
        </div>

        <div className="flex gap-2">
          {!isAtRoot && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateFolderOpen(true)}
                className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-2 font-semibold text-card-foreground hover:bg-accent"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Folder</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg"
              >
                <UploadIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Upload</span>
              </motion.button>
            </>
          )}
          {isAtRoot && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateFolderOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">New Folder</span>
            </motion.button>
          )}
        </div>
      </div>

      {!isShowingSearchResults && <EnhancedBreadcrumb path={breadcrumbs} currentFolderId={currentFolderId} />}

      {/* Search & Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files and folders..."
            className="h-12 w-full rounded-xl border-2 border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="h-12 rounded-xl border-2 border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">A → Z</option>
          <option value="name-desc">Z → A</option>
          <option value="size-desc">Largest First</option>
          <option value="size-asc">Smallest First</option>
        </select>
      </div>

      {/* Two-Pane Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: List */}
        <div className="flex w-full flex-col gap-4 overflow-y-auto lg:w-1/2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center dark:bg-red-950/20">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <>
              {/* Folders */}
              {displayFolders.length > 0 && (
                <div>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FolderOpen className="h-4 w-4" />
                    Folders ({displayFolders.length})
                  </h2>
                  <div className="grid gap-2">
                    {displayFolders.map((folder, index) => (
                      <FolderCardEnhanced
                        key={folder.id}
                        folder={folder}
                        onClick={() => {
                          setSearchTerm('')
                          setSearchResults(null)
                          router.push(`/explore?folder_id=${folder.id}`)
                        }}
                        onDelete={() => handleDeleteFolder(folder.id)}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {sortedFiles.length > 0 && (
                <div>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4" />
                    Files ({sortedFiles.length})
                  </h2>
                  <div className="space-y-2">
                    {sortedFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedFile(file)}
                        onDoubleClick={() => router.push(`/explore/${file.id}`)}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                          selectedFile?.id === file.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-card-foreground">{file.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size_bytes)} • {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {displayFolders.length === 0 && sortedFiles.length === 0 && (
                <EmptyState
                  type={isShowingSearchResults ? 'search' : 'empty'}
                  searchTerm={debouncedSearch}
                  onUpload={currentFolderId ? () => setIsUploadOpen(true) : undefined}
                  onCreateFolder={() => setIsCreateFolderOpen(true)}
                />
              )}
            </>
          )}
        </div>

        {/* Right: Preview (Desktop only) */}
        <div className="hidden w-1/2 flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 lg:flex">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="truncate text-lg font-bold text-card-foreground">{selectedFile.title}</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/explore/${selectedFile.id}`)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Open
                </motion.button>
              </div>
              <div className="flex-1 overflow-auto rounded-lg bg-muted p-8 text-center">
                <FileText className="mx-auto h-24 w-24 text-blue-500 mb-4" />
                <p className="text-sm text-muted-foreground">Double-click file to view</p>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Select a file to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        isLoading={isCreatingFolder}
      />

      <UploadDialogEnhanced
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        currentFolderId={currentFolderId}
      />
    </div>
  )
}