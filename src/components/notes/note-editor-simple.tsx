'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect } from 'react'
import { FormatToolbar } from './format-toolbar'

interface NoteEditorProps {
  content: string
  onChange: (html: string) => void
  editable?: boolean
}

export function NoteEditorSimple({ content, onChange, editable = true }: NoteEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing... (Use markdown shortcuts like ## for headings)',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
          dir: 'ltr',
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
        class: 'focus:outline-none min-h-[500px] p-6 max-w-4xl mx-auto',
        dir: 'ltr',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-2 text-sm text-gray-500">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col" dir="ltr">
      {editable && <FormatToolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto" dir="ltr">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}