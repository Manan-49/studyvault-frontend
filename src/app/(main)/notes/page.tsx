'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Globe, Lock, ArrowLeft } from 'lucide-react'
import { notesApi, Note } from '@/lib/api/notes' // ← Import Note type from API
import { useAuthStore } from '@/lib/stores/auth'
import { NotesSidebar } from '@/components/notes/notes-sidebar'
import { NoteEditorSimple } from '@/components/notes/note-editor-simple'
import { AutoSaveIndicator } from '@/components/notes/auto-save-indicator'
import { CreateNoteDialog } from '@/components/notes/create-note-dialog'
import { EmptyNotesState } from '@/components/notes/empty-notes-state'

// ← REMOVED local Note interface - using imported one

export default function NotesPage() {
  const { user } = useAuthStore()

  // State
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await notesApi.list({ page: 1, page_size: 100 })
      setNotes(data.items || [])
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Auto-save with debounce
  useEffect(() => {
    if (!selectedNote || !editorContent) return

    const timeout = setTimeout(async () => {
      // ✅ Fixed: Access content.html properly
      const currentContent = selectedNote.content?.html || ''
      if (editorContent !== currentContent) {
        setIsSaving(true)
        try {
          const updated = await notesApi.update(selectedNote.id, {
            content: { html: editorContent },
          })

          setNotes((prev) =>
            prev.map((note) => (note.id === updated.id ? updated : note))
          )
          setSelectedNote(updated)
        } catch (error) {
          console.error('Failed to save note:', error)
        } finally {
          setIsSaving(false)
        }
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [editorContent, selectedNote])

  // Handlers
  const handleCreateNote = async (title: string) => {
    setIsCreating(true)
    try {
      const newNote = await notesApi.create({
        title,
        content: { html: '<p>Start writing...</p>' },
        is_public: true,
      })

      setNotes((prev) => [newNote, ...prev])
      setSelectedNote(newNote)
      setEditorContent(newNote.content?.html || '')
      setIsCreateOpen(false)
      setShowMobileSidebar(false)
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setEditorContent(note.content?.html || '')
    setShowMobileSidebar(false)
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await notesApi.delete(id)
      setNotes((prev) => prev.filter((note) => note.id !== id))

      if (selectedNote?.id === id) {
        setSelectedNote(null)
        setEditorContent('')
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleTogglePublic = async () => {
    if (!selectedNote) return

    try {
      const updated = await notesApi.update(selectedNote.id, {
        is_public: !selectedNote.is_public,
      })

      setNotes((prev) =>
        prev.map((note) => (note.id === updated.id ? updated : note))
      )
      setSelectedNote(updated)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const isOwner = selectedNote?.owner_id === user?.id

   return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <div className="flex items-center justify-between">
          {selectedNote ? (
            <button
              onClick={() => {
                setSelectedNote(null)
                setEditorContent('')
              }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Notes</span>
            </button>
          ) : (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">📝 Notes</h1>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Show on desktop OR mobile when no note selected */}
        <div
          className={`w-full border-r border-gray-200 dark:border-gray-800 lg:w-80 ${
            selectedNote ? 'hidden lg:block' : 'block'
          }`}
        >
          <NotesSidebar
            notes={notes}
            selectedNote={selectedNote}
            currentUserId={user?.id}
            onSelectNote={handleSelectNote}
            onCreateNote={() => setIsCreateOpen(true)}
            onDeleteNote={handleDeleteNote}
            loading={loading}
          />
        </div>

        {/* Editor Area - Show when note selected OR always on desktop */}
        <div
          className={`flex-1 overflow-hidden bg-white dark:bg-gray-900 ${
            selectedNote ? 'block' : 'hidden lg:block'
          }`}
        >
          {selectedNote ? (
            <div className="flex h-full flex-col">
              {/* Editor Header */}
              <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedNote.title}
                    </h1>
                    <div className="mt-1">
                      <AutoSaveIndicator isSaving={isSaving} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTogglePublic}
                        className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-medium transition-all ${
                          selectedNote.is_public
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {selectedNote.is_public ? (
                          <>
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span className="hidden sm:inline">Private</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden">
                <NoteEditorSimple
                  content={editorContent}
                  onChange={setEditorContent}
                  editable={isOwner}
                />
              </div>
            </div>
          ) : (
            <EmptyNotesState onCreateNote={() => setIsCreateOpen(true)} />
          )}
        </div>
      </div>

      {/* Create Note Dialog */}
      <CreateNoteDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateNote}
        isLoading={isCreating}
      />
    </div>
  )
}