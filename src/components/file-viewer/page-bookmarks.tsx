'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Trash2, Plus } from 'lucide-react'

interface PageBookmarksProps {
  fileId: string
  currentPage: number
  onJumpToPage: (page: number) => void
}

interface BookmarkItem {
  page: number
  note: string
  timestamp: string
}

export function PageBookmarks({ fileId, currentPage, onJumpToPage }: PageBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [showAddNote, setShowAddNote] = useState(false)
  const [note, setNote] = useState('')

  // Load bookmarks
  useEffect(() => {
    const saved = localStorage.getItem(`bookmarks-${fileId}`)
    if (saved) {
      setBookmarks(JSON.parse(saved))
    }
  }, [fileId])

  // Save bookmarks
  const saveBookmarks = (newBookmarks: BookmarkItem[]) => {
    localStorage.setItem(`bookmarks-${fileId}`, JSON.stringify(newBookmarks))
    setBookmarks(newBookmarks)
  }

  const addBookmark = () => {
    const newBookmark: BookmarkItem = {
      page: currentPage,
      note: note.trim() || `Page ${currentPage}`,
      timestamp: new Date().toISOString(),
    }

    const existing = bookmarks.find((b) => b.page === currentPage)
    if (existing) {
      // Update existing
      const updated = bookmarks.map((b) =>
        b.page === currentPage ? newBookmark : b
      )
      saveBookmarks(updated)
    } else {
      // Add new
      saveBookmarks([...bookmarks, newBookmark].sort((a, b) => a.page - b.page))
    }

    setNote('')
    setShowAddNote(false)
  }

  const removeBookmark = (page: number) => {
    saveBookmarks(bookmarks.filter((b) => b.page !== page))
  }

  const isBookmarked = bookmarks.some((b) => b.page === currentPage)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Bookmarks</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddNote(!showAddNote)}
          className={`rounded-lg p-2 transition-colors ${
            isBookmarked
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              : 'hover:bg-accent'
          }`}
          title={isBookmarked ? 'Bookmarked' : 'Add bookmark'}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Add Bookmark Form */}
      <AnimatePresence>
        {showAddNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Note for page ${currentPage}...`}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              onKeyPress={(e) => e.key === 'Enter' && addBookmark()}
            />
            <div className="flex gap-2">
              <button
                onClick={addBookmark}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="inline h-4 w-4 mr-1" />
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddNote(false)
                  setNote('')
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmark List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No bookmarks yet
          </p>
        ) : (
          bookmarks.map((bookmark) => (
            <motion.div
              key={bookmark.page}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`group flex items-start gap-2 rounded-lg border p-2 transition-colors ${
                bookmark.page === currentPage
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <button
                onClick={() => onJumpToPage(bookmark.page)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    P.{bookmark.page}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{bookmark.note}</p>
              </button>
              <button
                onClick={() => removeBookmark(bookmark.page)}
                className="rounded p-1 opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}