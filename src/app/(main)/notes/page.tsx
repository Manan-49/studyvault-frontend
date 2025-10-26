'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Globe, Lock, ArrowLeft, Users, CheckCircle, Sparkles } from 'lucide-react'
import { notesApi, Note, CheckboxUser } from '@/lib/api/notes'
import { useAuthStore } from '@/lib/stores/auth'
import { NotesSidebar } from '@/components/notes/notes-sidebar'
import { NoteEditorSimple } from '@/components/notes/note-editor-simple'
import { AutoSaveIndicator } from '@/components/notes/auto-save-indicator'
import { CreateNoteDialog } from '@/components/notes/create-note-dialog'
import { MarkdownImportDialog } from '@/components/notes/markdown-import-dialog'
import { EmptyNotesState } from '@/components/notes/empty-notes-state'

export default function NotesPage() {
  const { user } = useAuthStore()

  // State
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

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
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleImportMarkdown = async (title: string, markdown: string) => {
    setIsImporting(true)
    try {
      const newNote = await notesApi.importMarkdown({
        title,
        markdown,
        is_public: true,
      })

      setNotes((prev) => [newNote, ...prev])
      setSelectedNote(newNote)
      setEditorContent(newNote.content?.html || '')
      setIsImportOpen(false)
    } catch (error) {
      console.error('Failed to import markdown:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setEditorContent(note.content?.html || '')
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

  const handleCheckboxToggle = async (checkboxId: string, checked: boolean) => {
    if (!selectedNote) return

    try {
      const updated = await notesApi.toggleCheckbox(selectedNote.id, checkboxId, checked)

      setNotes((prev) =>
        prev.map((note) => (note.id === updated.id ? updated : note))
      )
      setSelectedNote(updated)
    } catch (error) {
      console.error('Failed to toggle checkbox:', error)
    }
  }

  const isOwner = selectedNote?.owner_id === user?.id

  // Calculate collaboration stats
  const totalCollaborators = selectedNote
    ? new Set(
        Object.values(selectedNote.checkboxes || {})
          .flat()
          .map((u) => u.user_id)
      ).size
    : 0

  const totalCheckboxes = selectedNote
    ? Object.keys(selectedNote.checkboxes || {}).length
    : 0

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="border-b border-border bg-card p-4 lg:hidden">
        <div className="flex items-center justify-between">
          {selectedNote ? (
            <button
              onClick={() => {
                setSelectedNote(null)
                setEditorContent('')
              }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Notes</span>
            </button>
          ) : (
            <h1 className="text-xl font-bold text-card-foreground">📝 Notes</h1>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-full border-r border-border lg:w-80 ${
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
            onImportMarkdown={() => setIsImportOpen(true)}
            loading={loading}
          />
        </div>

        {/* Editor Area */}
        <div
          className={`flex-1 overflow-hidden ${
            selectedNote ? 'block' : 'hidden lg:block'
          }`}
        >
          {selectedNote ? (
            <div className="flex h-full flex-col bg-card">
              {/* Editor Header */}
              <div className="border-b border-border bg-gradient-to-r from-card to-muted p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-2xl font-bold text-foreground">
                      {selectedNote.title}
                    </h1>
                    <div className="mt-2 flex items-center gap-3">
                      <AutoSaveIndicator isSaving={isSaving} />

                      {/* Collaboration Stats */}
                      {selectedNote.is_public && (
                        <>
                          {totalCollaborators > 0 && (
                            <div className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 dark:bg-purple-900/30">
                              <Users className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                {totalCollaborators} {totalCollaborators === 1 ? 'person' : 'people'}
                              </span>
                            </div>
                          )}

                          {totalCheckboxes > 0 && (
                            <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30">
                              <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                {totalCheckboxes} {totalCheckboxes === 1 ? 'checkbox' : 'checkboxes'}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTogglePublic}
                        className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-medium shadow-sm transition-all ${
                          selectedNote.is_public
                            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 hover:shadow-md dark:border-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {selectedNote.is_public ? (
                          <>
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">Collaborative</span>
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
                  checkboxes={selectedNote.checkboxes}
                  currentUserId={user?.id}
                  onCheckboxToggle={handleCheckboxToggle}
                />
              </div>
            </div>
          ) : (
            <EmptyNotesState onCreateNote={() => setIsCreateOpen(true)} />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateNoteDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateNote}
        isLoading={isCreating}
      />

      <MarkdownImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportMarkdown}
        isLoading={isImporting}
      />
    </div>
  )
}