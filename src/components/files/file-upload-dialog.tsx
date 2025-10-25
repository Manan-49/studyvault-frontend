'use client'

import { useState, useEffect } from 'react'
import { filesApi } from '@/lib/api/files'
import { foldersApi } from '@/lib/api/folders'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X, FolderOpen, CheckCircle2 } from 'lucide-react'
import { toast } from '@/lib/hooks/use-toast'

interface FileUploadDialogProps {
  currentFolderId?: string
  onSuccess?: () => void
}

interface Folder {
  id: string
  path: string
  name: string
}

export function FileUploadDialog({ currentFolderId, onSuccess }: FileUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [folderId, setFolderId] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loadingFolders, setLoadingFolders] = useState(false)

  // Load folders when dialog opens
  useEffect(() => {
    if (open) {
      loadFolders()
    }
  }, [open])

  // Set folderId whenever currentFolderId changes
  useEffect(() => {
    if (currentFolderId) {
      setFolderId(currentFolderId)
    } else {
      setFolderId('')
    }
  }, [currentFolderId, open])

  const loadFolders = async () => {
    setLoadingFolders(true)
    try {
      const response = await foldersApi.list({ page: 1, page_size: 100 })
      setFolders(response.items || [])
    } catch (error) {
      console.error('Failed to load folders:', error)
      toast({
        title: 'Failed to load folders',
        variant: 'destructive',
      })
    } finally {
      setLoadingFolders(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: 'Please select at least one file', variant: 'destructive' })
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
        
        if (folderId && folderId.trim() !== '') {
          formData.append('folder_id', folderId)
        }
        
        formData.append('ocr', 'true')

        await filesApi.upload(formData)
        successCount++
      } catch (error: any) {
        console.error('Upload error:', error)
        failCount++
      }
    }

    setUploading(false)

    if (successCount > 0) {
      toast({
        title: 'Upload complete',
        description: `Successfully uploaded ${successCount} file(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
      })
      onSuccess?.()
    }

    if (failCount === files.length) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please check file types and sizes.',
        variant: 'destructive',
      })
    }

    setFiles([])
    setOpen(false)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const currentFolder = folders.find((f) => f.id === currentFolderId)
  const otherFolders = folders
    .filter((f) => f.id !== currentFolderId)
    .sort((a, b) => a.path.localeCompare(b.path))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="mt-1 cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supported: PDF, PNG, JPG (max 100MB per file)
            </p>
          </div>

          {files.length > 0 && (
            <div className="max-h-40 space-y-2 overflow-y-auto rounded border border-gray-200 dark:border-gray-700 p-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded bg-gray-50 dark:bg-gray-800 p-2"
                >
                  <span className="truncate text-sm text-gray-900 dark:text-gray-100">{file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="folder">Upload Location</Label>
            <div className="relative mt-1">
              <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                id="folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                disabled={loadingFolders}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {!currentFolderId && (
                  <option value="" className="font-semibold">
                    ✅ 📁 Root (Current Location)
                  </option>
                )}
                {currentFolderId && <option value="">📁 Root (No Folder)</option>}

                {currentFolder && (
                  <option value={currentFolder.id} className="font-semibold">
                    ✅ 📁 {currentFolder.path} (Current)
                  </option>
                )}

                {otherFolders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    📁 {folder.path}
                  </option>
                ))}
              </select>
            </div>
            {currentFolderId && (
              <p className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Will upload to: {currentFolder?.path || 'Current folder'}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload {files.length > 0 && `(${files.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}