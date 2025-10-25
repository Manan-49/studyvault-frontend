'use client'

import { ReactRenderer } from '@tiptap/react'
import { SuggestionOptions } from '@tiptap/suggestion'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
} from 'lucide-react'

interface CommandItem {
  title: string
  description: string
  icon: React.ReactNode
  command: ({ editor, range }: any) => void
}

interface CommandsListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

const CommandsList = forwardRef<any, CommandsListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="z-50 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={index}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
              index === selectedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
            }`}
            onClick={() => selectItem(index)}
            type="button"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-white">
              {item.icon}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate font-medium">{item.title}</div>
              <div className="truncate text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-gray-500">No results</div>
      )}
    </div>
  )
})

CommandsList.displayName = 'CommandsList'

export const getSuggestionItems = ({ query }: { query: string }): CommandItem[] => {
  const commands: CommandItem[] = [
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: <Heading1 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run()
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run()
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: <List className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering',
      icon: <ListOrdered className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: 'To-do List',
      description: 'Track tasks with checkboxes',
      icon: <CheckSquare className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: <Quote className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: 'Code Block',
      description: 'Display code with syntax',
      icon: <Code className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks',
      icon: <Minus className="h-4 w-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
  ]

  return commands.filter((item) =>
    item.title.toLowerCase().startsWith(query.toLowerCase())
  )
}

export const renderSuggestion: SuggestionOptions['render'] = () => {
  let component: ReactRenderer | null = null
  let popup: TippyInstance[] | null = null

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandsList, {
        props,
        editor: props.editor,
      })

      if (!props.clientRect) {
        return
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })
    },

    onUpdate(props: any) {
      component?.updateProps(props)

      if (!props.clientRect) {
        return
      }

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup?.[0]?.hide()
        return true
      }

      return (component?.ref as any)?.onKeyDown?.(props) || false
    },

    onExit() {
      popup?.[0]?.destroy()
      component?.destroy()
      popup = null
      component = null
    },
  }
}