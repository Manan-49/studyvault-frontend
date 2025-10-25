'use client'

import { Editor } from '@tiptap/react'
import { motion } from 'framer-motion'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Undo,
  Redo,
  Minus,
} from 'lucide-react'

interface FormatToolbarProps {
  editor: Editor
}

export function FormatToolbar({ editor }: FormatToolbarProps) {
  const buttons = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      disabled: !editor.can().chain().focus().toggleBold().run(),
      label: 'Bold',
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      disabled: !editor.can().chain().focus().toggleItalic().run(),
      label: 'Italic',
    },
    { divider: true },
    {
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      label: 'Heading 1',
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      label: 'Heading 2',
    },
    {
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      label: 'Heading 3',
    },
    { divider: true },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      label: 'Bullet List',
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      label: 'Numbered List',
    },
    {
      icon: CheckSquare,
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive('taskList'),
      label: 'Task List',
    },
    { divider: true },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      label: 'Quote',
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      label: 'Code Block',
    },
    {
      icon: Minus,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      label: 'Divider',
    },
    { divider: true },
    {
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().chain().focus().undo().run(),
      label: 'Undo',
    },
    {
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().chain().focus().redo().run(),
      label: 'Redo',
    },
  ]

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex flex-wrap items-center gap-1 p-2">
        {buttons.map((button, index) => {
          if ('divider' in button) {
            return <div key={index} className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-700" />
          }

          const Icon = button.icon

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={button.action}
              disabled={button.disabled}
              title={button.label}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                button.isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <Icon className="h-4 w-4" />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}