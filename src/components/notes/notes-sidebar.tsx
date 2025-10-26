'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, FileText, Lock, Globe, Trash2, X, Upload, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Note } from '@/lib/api/notes'

interface NotesSidebarProps {
  notes: Note[]
  selectedNote: Note | null
  currentUserId?: string
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
  onImportMarkdown: () => void
  loading?: boolean
}

export function NotesSidebar({
  notes,
  selectedNote,
  currentUserId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onImportMarkdown,
  loading,
}: NotesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPreview = (content: Record<string, any>) => {
    const html = content?.html || ''
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.slice(0, 80) + (text.length > 80 ? '...' : '')
  }

  const myNotes = filteredNotes.filter((note) => note.owner_id === currentUserId)
  const sharedNotes = filteredNotes.filter((note) => note.owner_id !== currentUserId)

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notes</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{notes.length} total</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-3 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNote}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span>New Note</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onImportMarkdown}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-green-500 hover:bg-green-50 hover:text-green-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-green-900/20"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="h-10 w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-10 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
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
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
              <FileText className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first note to get started'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateNote}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Create Note
              </motion.button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* My Notes Section */}
            {myNotes.length > 0 && (
              <div>
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  My Notes ({myNotes.length})
                </h3>
                <AnimatePresence mode="popLayout">
                  {myNotes.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      isOwner={true}
                      index={index}
                      onSelect={() => onSelectNote(note)}
                      onDelete={onDeleteNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Shared Notes Section */}
            {sharedNotes.length > 0 && (
              <div>
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Shared with me ({sharedNotes.length})
                </h3>
                <AnimatePresence mode="popLayout">
                  {sharedNotes.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      isOwner={false}
                      index={index}
                      onSelect={() => onSelectNote(note)}
                      onDelete={onDeleteNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Sub-component: Note Card
function NoteCard({
  note,
  isSelected,
  isOwner,
  index,
  onSelect,
  onDelete,
}: {
  note: Note
  isSelected: boolean
  isOwner: boolean
  index: number
  onSelect: () => void
  onDelete: (id: string) => void
}) {
  const getPreview = (content: Record<string, any>) => {
    const html = content?.html || ''
    const text = html.replace(/<[^>]*>/g, '').trim()
    return text.slice(0, 80) + (text.length > 80 ? '...' : '')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ x: 4 }}
      className="mb-2"
    >
      <div
        onClick={onSelect}
        className={`group relative cursor-pointer rounded-xl border-2 p-3 transition-all ${
          isSelected
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg dark:from-blue-900/30 dark:to-indigo-900/30'
            : 'border-transparent bg-white hover:border-gray-200 hover:shadow-md dark:bg-gray-800/50 dark:hover:border-gray-700'
        }`}
      >
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="flex-1 truncate font-semibold text-gray-900 dark:text-white">
            {note.title || 'Untitled'}
          </h3>

          <div className="flex items-center gap-1.5">
            {note.is_public ? (
              <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                <Globe className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-700">
                <Lock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              </div>
            )}

            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Delete "${note.title}"?`)) {
                    onDelete(note.id)
                  }
                }}
                className="rounded-full p-1 opacity-0 transition-all hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-3 w-3 text-red-500 dark:text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {note.content && (
          <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {getPreview(note.content)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </p>

          {!isOwner && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              Shared
            </span>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            layoutId="selected-indicator"
            className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-gradient-to-b from-blue-600 to-indigo-600"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </div>
    </motion.div>
  )
}