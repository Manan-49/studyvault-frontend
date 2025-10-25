'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, FileText, Lock, Globe, Trash2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Note } from '@/lib/api/notes' // ← Import Note type

interface NotesSidebarProps {
  notes: Note[]
  selectedNote: Note | null
  currentUserId?: string
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  loading?: boolean
}

export function NotesSidebar({
  notes,
  selectedNote,
  currentUserId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  loading,
}: NotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ✅ Fixed: Access content.html properly from Record<string, any>
  const getPreview = (content: Record<string, any>) => {
    const html = content?.html || ''
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.slice(0, 60) + (text.length > 60 ? '...' : '')
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">📝 Notes</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateNote}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-shadow hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-10 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div>
              <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, index) => {
              const isSelected = selectedNote?.id === note.id
              const isOwner = note.owner_id === currentUserId

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="mb-2"
                >
                  <div
                    onClick={() => onSelectNote(note)}
                    className={`group relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20'
                        : 'border-transparent bg-gray-50 hover:border-gray-200 hover:bg-white hover:shadow-sm dark:bg-gray-800 dark:hover:border-gray-700 dark:hover:bg-gray-900'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="flex-1 truncate font-semibold text-gray-900 dark:text-white">
                        {note.title || 'Untitled'}
                      </h3>
                      <div className="flex items-center gap-1">
                        {note.is_public ? (
                          <Globe className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-gray-400" />
                        )}
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Delete this note?')) {
                                onDeleteNote(note.id)
                              }
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500 hover:text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {note.content && (
                      <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                        {getPreview(note.content)}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}