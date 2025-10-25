// src/app/(main)/explore/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Upload as UploadIcon, ArrowUpDown, Sparkles } from 'lucide-react'
import { filesApi } from '@/lib/api/files'
import { foldersApi } from '@/lib/api/folders'
import { searchApi } from '@/lib/api/search'
import { EnhancedBreadcrumb } from '@/components/explore/enhanced-breadcrumb'
import { SearchBarEnhanced } from '@/components/explore/search-bar-enhanced'
import { ViewToggle, ViewMode } from '@/components/explore/view-toggle'
import { FolderCardEnhanced } from '@/components/explore/folder-card-enhanced'
import { FileCardEnhanced } from '@/components/explore/file-card-enhanced'
import { LoadingGrid } from '@/components/explore/loading-grid'
import { EmptyState } from '@/components/explore/empty-state'
import { CreateFolderDialog } from '@/components/explore/create-folder-dialog'
import { MoveFileDialog } from '@/components/explore/move-file-dialog'
import { UploadDialogEnhanced } from '@/components/explore/upload-dialog-enhanced'
import { ToastSimple } from '@/components/explore/toast-simple'
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
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [allFolders, setAllFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    files: FileItem[]
    folders: Folder[]
    total: number
  } | null>(null)

  // Dialog states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isMovingFile, setIsMovingFile] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  // Load view mode from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('explore-view-mode') as ViewMode
    if (savedView) setViewMode(savedView)
  }, [])

  // Save view mode to localStorage
  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    localStorage.setItem('explore-view-mode', view)
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch folder/file data (normal browsing)
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
        if (item.type === 'file' && item.file) {
          searchFiles.push(item.file)
        } else if (item.type === 'folder' && item.folder) {
          searchFolders.push(item.folder)
        }
      })

      setSearchResults({
        files: searchFiles,
        folders: searchFolders,
        total: response.meta.total,
      })
    } catch (err) {
      console.error('Search failed:', err)
      showToast('Search failed', 'error')
      setSearchResults(null)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Initial data load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Trigger search when debounced search changes
  useEffect(() => {
    if (debouncedSearch) {
      performSearch(debouncedSearch)
    } else {
      setSearchResults(null)
    }
  }, [debouncedSearch, performSearch])

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
  }

  // Create folder
  const handleCreateFolder = async (name: string) => {
    setIsCreatingFolder(true)
    try {
      await foldersApi.create({ name, parent_id: currentFolderId })
      await fetchData()
      setIsCreateFolderOpen(false)
      showToast('Folder created successfully', 'success')
    } catch (err) {
      console.error('Failed to create folder:', err)
      showToast('Failed to create folder', 'error')
    } finally {
      setIsCreatingFolder(false)
    }
  }

  // Delete folder
  const handleDeleteFolder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) return

    try {
      await foldersApi.delete(id)
      await fetchData()
      if (searchResults) {
        performSearch(debouncedSearch)
      }
      showToast('Folder deleted successfully', 'success')
    } catch (err) {
      console.error('Failed to delete folder:', err)
      showToast('Failed to delete folder', 'error')
    }
  }

  // Delete file
  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      await filesApi.delete(id)
      await fetchData()
      if (searchResults) {
        performSearch(debouncedSearch)
      }
      showToast('File deleted successfully', 'success')
    } catch (err) {
      console.error('Failed to delete file:', err)
      showToast('Failed to delete file', 'error')
    }
  }

  // Download file
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
      console.error('Download failed:', err)
      showToast('Download failed', 'error')
    }
  }

  // Move file
  const handleMoveFile = async (folderId: string | null) => {
    if (!selectedFileId) return
    setIsMovingFile(true)

    try {
      await filesApi.update(selectedFileId, { folder_id: folderId })
      await fetchData()
      if (searchResults) {
        performSearch(debouncedSearch)
      }
      setIsMoveDialogOpen(false)
      setSelectedFileId(null)
      showToast('File moved successfully', 'success')
    } catch (err) {
      console.error('Failed to move file:', err)
      showToast('Failed to move file', 'error')
    } finally {
      setIsMovingFile(false)
    }
  }

  // Upload files
  const handleUpload = async (uploadFiles: File[]) => {
    let successCount = 0
    let failCount = 0

    for (const file of uploadFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''))

        if (currentFolderId && currentFolderId.trim() !== '') {
          formData.append('folder_id', currentFolderId)
        }

        formData.append('ocr', 'true')

        await filesApi.upload(formData)
        successCount++
      } catch (error) {
        console.error('Upload error:', error)
        failCount++
      }
    }

    await fetchData()

    if (successCount > 0) {
      showToast(
        `Successfully uploaded ${successCount} file(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
        'success'
      )
    } else {
      showToast('All uploads failed', 'error')
    }
  }

  // Determine which data to display (search results or folder contents)
  const displayFolders = searchResults ? searchResults.folders : folders
  const displayFiles = searchResults ? searchResults.files : files

  // Filter and sort
  const breadcrumbs = currentFolder ? currentFolder.path.split('/').filter(Boolean) : []

  let filteredFolders = [...displayFolders].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'size-asc':
      case 'size-desc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      default:
        return 0
    }
  })

  let filteredFiles = [...displayFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.title.localeCompare(b.title)
      case 'name-desc':
        return b.title.localeCompare(a.title)
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'size-asc':
        return a.size_bytes - b.size_bytes
      case 'size-desc':
        return b.size_bytes - a.size_bytes
      default:
        return 0
    }
  })

  const totalResults = filteredFolders.length + filteredFiles.length
  const hasContent = folders.length > 0 || files.length > 0
  const hasFilteredContent = filteredFolders.length > 0 || filteredFiles.length > 0

  const isShowingSearchResults = Boolean(searchResults)

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Toast */}
      <ToastSimple
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            📂 Explore
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isShowingSearchResults
              ? `Search results for "${debouncedSearch}"`
              : 'Browse and organize your files'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateFolderOpen(true)}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">New Folder</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
          >
            <UploadIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Upload Files</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Breadcrumb - Only show when NOT searching */}
      {!isShowingSearchResults && (
        <EnhancedBreadcrumb path={breadcrumbs} currentFolderId={currentFolderId} />
      )}

      {/* Search, Sort & View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBarEnhanced
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search files, folders, and content (OCR-powered)..."
            resultCount={isShowingSearchResults ? totalResults : undefined}
          />
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Searching through OCR text...</span>
            </motion.div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-12 w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 pr-10 text-sm font-medium text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-auto"
            >
              <option value="date-desc">📅 Newest First</option>
              <option value="date-asc">📅 Oldest First</option>
              <option value="name-asc">🔤 A → Z</option>
              <option value="name-desc">🔤 Z → A</option>
              <option value="size-desc">💾 Largest First</option>
              <option value="size-asc">💾 Smallest First</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* View Toggle */}
          <ViewToggle view={viewMode} onChange={handleViewChange} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingGrid count={8} viewMode={viewMode} />
      ) : error ? (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      ) : !hasContent && !isShowingSearchResults ? (
        <EmptyState
          type="empty"
          onUpload={() => setIsUploadOpen(true)}
          onCreateFolder={() => setIsCreateFolderOpen(true)}
        />
      ) : !hasFilteredContent && isShowingSearchResults ? (
        <EmptyState type="search" searchTerm={debouncedSearch} />
      ) : (
        <>
          {/* Folders */}
          {filteredFolders.length > 0 && (
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
              >
                📁 Folders ({filteredFolders.length})
              </motion.h2>
              <div
                className={`grid gap-4 ${
                  viewMode === 'list'
                    ? 'grid-cols-1'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {filteredFolders.map((folder, index) => (
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
          {filteredFiles.length > 0 && (
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
              >
                📄 Files ({filteredFiles.length})
                {isShowingSearchResults && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    (including OCR matches)
                  </span>
                )}
              </motion.h2>
              <div
                className={`grid gap-4 ${
                  viewMode === 'list'
                    ? 'grid-cols-1'
                    : viewMode === 'compact'
                      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {filteredFiles.map((file, index) => (
                  <FileCardEnhanced
                    key={file.id}
                    file={file}
                    onClick={() => router.push(`/explore/${file.id}`)}
                    onDownload={() => handleDownload(file)}
                    onMove={() => {
                      setSelectedFileId(file.id)
                      setIsMoveDialogOpen(true)
                    }}
                    onDelete={() => handleDeleteFile(file.id)}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        isLoading={isCreatingFolder}
      />

      <MoveFileDialog
        isOpen={isMoveDialogOpen}
        onClose={() => {
          setIsMoveDialogOpen(false)
          setSelectedFileId(null)
        }}
        onMove={handleMoveFile}
        folders={allFolders}
        isLoading={isMovingFile}
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