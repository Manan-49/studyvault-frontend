'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect, useRef } from 'react'
import { FormatToolbar } from './format-toolbar'
import { CollaborativeCheckbox } from './collaborative-checkbox'
import { CheckboxUser } from '@/lib/api/notes'

interface NoteEditorProps {
  content: string
  onChange: (html: string) => void
  editable?: boolean
  checkboxes?: Record<string, CheckboxUser[]>
  currentUserId?: string
  onCheckboxToggle?: (checkboxId: string, checked: boolean) => void
}

export function NoteEditorSimple({
  content,
  onChange,
  editable = true,
  checkboxes = {},
  currentUserId,
  onCheckboxToggle,
}: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing... Use markdown shortcuts like ## for headings, - [ ] for checkboxes',
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] px-6 py-4 max-w-4xl mx-auto prose prose-lg dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Inject collaborative checkboxes after editor updates
  useEffect(() => {
    if (!editorRef.current || !onCheckboxToggle) return

    const taskItems = editorRef.current.querySelectorAll('[data-type="taskItem"]')

    taskItems.forEach((item, index) => {
      const checkboxId = `checkbox-${index}`
      const checkbox = item.querySelector('input[type="checkbox"]')
      const users = checkboxes[checkboxId] || []
      const currentUserChecked = users.some((u) => u.user_id === currentUserId && u.checked)

      if (checkbox) {
        // Hide default checkbox
        const input = checkbox as HTMLInputElement
        input.style.display = 'none'

        // Check if we already added our custom checkbox
        if (!item.querySelector('.collaborative-checkbox-wrapper')) {
          const wrapper = document.createElement('div')
          wrapper.className = 'collaborative-checkbox-wrapper flex items-center gap-2 mb-2'

          // Create custom checkbox element
          const customCheckbox = document.createElement('div')
          customCheckbox.className = 'custom-checkbox'

          // Toggle handler
          customCheckbox.onclick = (e) => {
            e.stopPropagation()
            onCheckboxToggle(checkboxId, !currentUserChecked)
          }

          wrapper.appendChild(customCheckbox)

          // Insert before content
          item.insertBefore(wrapper, item.firstChild)
        }
      }
    })
  }, [editor?.state.doc, checkboxes, currentUserId, onCheckboxToggle])

  if (!editor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900" dir="ltr">
      {editable && <FormatToolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto" dir="ltr" ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}