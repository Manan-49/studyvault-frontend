'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { getSuggestionItems, renderSuggestion } from './slash-commands'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  CheckSquare,
  Code,
} from 'lucide-react'

interface RichEditorProps {
  content: string
  onChange: (content: string) => void
  onCheckboxClick?: (checkboxId: string, checked: boolean) => void
  editable?: boolean
}

// ✅ Slash Command Extension using Suggestion
const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: getSuggestionItems,
        render: renderSuggestion,
      }),
    ]
  },
})

// ✅ Custom TaskItem with unique IDs and click tracking
const CustomTaskItem = TaskItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      checked: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-checked') === 'true',
        renderHTML: (attributes) => ({
          'data-checked': attributes.checked,
        }),
      },
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            attributes.id = `checkbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
          return {
            'data-id': attributes.id,
          }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('label')
      const checkboxStyler = document.createElement('span')
      const content = document.createElement('div')

      checkboxWrapper.contentEditable = 'false'
      checkboxStyler.addEventListener('click', (event) => {
        event.preventDefault()
        
        if (editor.isEditable && typeof getPos === 'function') {
          const { checked, id } = node.attrs
          const checkboxId = id || `checkbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              const pos = getPos()
              if (typeof pos === 'number') {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  checked: !checked,
                  id: checkboxId,
                })
              }
              return true
            })
            .run()

          // Trigger callback for backend update
          const onCheckboxClick = (editor as any).storage?.onCheckboxClick
          if (onCheckboxClick && typeof onCheckboxClick === 'function') {
            onCheckboxClick(checkboxId, !checked)
          }
        }
      })

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value as string)
      })

      listItem.dataset.checked = String(node.attrs.checked)
      if (node.attrs.id) {
        listItem.dataset.id = node.attrs.id
      }

      checkboxWrapper.append(checkboxStyler, content)
      listItem.append(checkboxWrapper)

      return {
        dom: listItem,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }

          listItem.dataset.checked = String(updatedNode.attrs.checked)
          if (updatedNode.attrs.id) {
            listItem.dataset.id = updatedNode.attrs.id
          }
          return true
        },
      }
    }
  },
})

export function RichEditor({
  content,
  onChange,
  onCheckboxClick,
  editable = true,
}: RichEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      TaskList,
      CustomTaskItem.configure({
        nested: true,
      }),
      SlashCommand,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  })

  // Store checkbox callback in editor storage
  useEffect(() => {
    if (editor && onCheckboxClick) {
      (editor as any).storage.onCheckboxClick = onCheckboxClick
    }
  }, [editor, onCheckboxClick])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!mounted || !editor) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-muted">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted p-2">
          <Button
            size="sm"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            type="button"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            type="button"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="mx-1 w-px bg-border" />
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            type="button"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            type="button"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <div className="mx-1 w-px bg-border" />
          <Button
            size="sm"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            type="button"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            type="button"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('taskList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            type="button"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          <div className="mx-1 w-px bg-border" />
          <Button
            size="sm"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            type="button"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            type="button"
          >
            <Code className="h-4 w-4" />
          </Button>
          <div className="mx-1 w-px bg-border" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            type="button"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            type="button"
          >1
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}