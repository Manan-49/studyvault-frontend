'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, ZoomIn, ZoomOut, RotateCw, Check, Image as ImageIcon } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { authApi } from '@/lib/api/auth'
import CustomButton from './custom-button'
import getCroppedImg from '../../hooks/crop-image-helper'

interface AvatarUploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AvatarUploadModal({
  open,
  onClose,
  onSuccess,
}: AvatarUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleUpload = async () => {
    if (!preview || !croppedAreaPixels) return

    setUploading(true)
    setError('')

    try {
      const croppedBlob = await getCroppedImg(preview, croppedAreaPixels, rotation)
      const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
      
      await authApi.uploadAvatar(file)
      
      onSuccess()
      handleClose()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    setError('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setCroppedAreaPixels(null)
    onClose()
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1))
  }

  const handleChangeImage = () => {
    setPreview(null)
    setSelectedFile(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setError('')
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl"
              >
                <div className="bg-card rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-card/20 rounded-lg backdrop-blur-sm">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">Upload Avatar</h2>
                        <p className="text-sm text-blue-100 mt-0.5">Crop and adjust your profile picture</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-white/80 hover:text-white hover:bg-card/20 p-2 rounded-lg transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {!preview ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                          relative border-2 border-dashed rounded-2xl p-16 transition-all cursor-pointer
                          ${isDragging 
                            ? 'border-blue-500 bg-blue-50 scale-105' 
                            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className={`
                            p-5 rounded-2xl transition-all
                            ${isDragging 
                              ? 'bg-blue-500 scale-110' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-500'
                            }
                          `}>
                            <Upload className="h-10 w-10 text-white" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-slate-700">
                              {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-6">
                        {/* Crop Area */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative h-[400px] bg-slate-900 rounded-2xl overflow-hidden"
                        >
                          <Cropper
                            image={preview}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                          />
                        </motion.div>

                        {/* Controls */}
                        <div className="space-y-5">
                          {/* Zoom Control */}
                          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <ZoomIn className="h-4 w-4" />
                                Zoom
                              </label>
                              <span className="text-sm font-medium text-slate-900">
                                {Math.round(zoom * 100)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={handleZoomOut}
                                className="p-2.5 rounded-lg bg-card border border-border hover:bg-accent hover:border-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={zoom <= 1}
                              >
                                <ZoomOut className="h-4 w-4 text-slate-700" />
                              </button>
                              <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(139 92 246) 100%)`
                                }}
                              />
                              <button
                                onClick={handleZoomIn}
                                className="p-2.5 rounded-lg bg-card border border-border hover:bg-accent hover:border-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={zoom >= 3}
                              >
                                <ZoomIn className="h-4 w-4 text-slate-700" />
                              </button>
                            </div>
                          </div>

                          {/* Rotation & Change Image */}
                          <div className="flex gap-3">
                            <button
                              onClick={handleRotate}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-card border-2 border-border hover:border-primary hover:bg-primary/10 rounded-xl transition-all font-medium text-card-foreground hover:text-primary"
                            >
                              <RotateCw className="h-4 w-4" />
                              Rotate 90°
                            </button>
                            <button
                              onClick={handleChangeImage}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-card border-2 border-border hover:border-purple-500 hover:bg-purple-50 rounded-xl transition-all font-medium text-card-foreground hover:text-purple-700"
                            >
                              <Upload className="h-4 w-4" />
                              Change Image
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200"
                      >
                        <X className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {/* Actions */}
                    {preview && (
                      <div className="flex gap-3 pt-2">
                        <CustomButton
                          onClick={handleUpload}
                          loading={uploading}
                          variant="primary"
                          icon={Check}
                          className="flex-1"
                        >
                          Upload Avatar
                        </CustomButton>
                        <CustomButton
                          onClick={handleClose}
                          variant="secondary"
                          disabled={uploading}
                        >
                          Cancel
                        </CustomButton>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}