import type { ConsoleAction } from '#lib/types'
import { CheckIcon, ChevronUpIcon, CircleXIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

import { cn } from '#lib/utils'
import { Button } from './ui/button'

interface ConsolePart {
  key: string
  value: unknown
}

interface ConsoleEntry {
  id: number
  type: ConsoleAction['type']
  parts: ConsolePart[]
}

function isConsoleAction(value: unknown): value is ConsoleAction {
  if (typeof value !== 'object' || value === null)
    return false

  const message = value as Partial<ConsoleAction>
  return message.__webground === true && typeof message.type === 'string' && Array.isArray(message.data)
}

function formatConsoleValue(value: unknown) {
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  }
  catch {
    return String(value)
  }
}

export function Console() {
  const [messages, setMessages] = useState<ConsoleEntry[]>([])
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [cleared, setCleared] = useState(false)
  const nextIdRef = useRef(0)
  const clearedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const messageCounts = {
    log: messages.filter(m => m.type === 'log').length,
    warn: messages.filter(m => m.type === 'warn').length,
    error: messages.filter(m => m.type === 'error').length,
  }

  function toggle() {
    setIsCollapsed(prev => !prev)
  }

  function clearMessages() {
    setMessages([])
  }

  function markCleared() {
    setCleared(true)
    clearTimeout(clearedTimerRef.current)
    clearedTimerRef.current = setTimeout(setCleared, 2000, false)
  }

  useEffect(() => {
    return () => clearTimeout(clearedTimerRef.current)
  }, [])

  useEventListener('message', (event: MessageEvent) => {
    if (!isConsoleAction(event.data))
      return

    if (event.data.type === 'clear') {
      clearMessages()
      return
    }

    const id = ++nextIdRef.current
    const entry: ConsoleEntry = {
      id,
      type: event.data.type,
      parts: event.data.data.map((value, index) => ({
        key: `${id}-${index}`,
        value,
      })),
    }
    setMessages(previous => [entry, ...previous])
  })

  useEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
      event.preventDefault()
      toggle()
    }
  })

  return (
    <div className="border-t bg-zinc-100 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-2 dark:bg-zinc-800">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Console</h3>

          <div className="flex items-center gap-2 text-xs">

            {messageCounts.log > 0 && (
              <span className="rounded-full border bg-zinc-200 px-2 py-0.5 dark:bg-zinc-800">
                {messageCounts.log}
              </span>
            )}

            {messageCounts.warn > 0 && (
              <span className="rounded-full border bg-yellow-500/10 px-2 py-0.5 text-yellow-500">
                {messageCounts.warn}
              </span>
            )}

            {messageCounts.error > 0 && (
              <span className="rounded-full border bg-red-500/10 px-2 py-0.5 text-red-500">
                {messageCounts.error}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              clearMessages()
              markCleared()
            }}
            size="icon"
            className="relative"
            variant="destructive"
          >

            <CheckIcon size={16} className={cn('absolute scale-0 transition-all', cleared && 'scale-100')} />
            <Trash2Icon size={16} className={cn('transition-all', cleared && 'scale-0')} />
            <span className="sr-only">Clear</span>
          </Button>

          <Button size="icon" variant="outline" onClick={toggle}>
            <ChevronUpIcon size={14} className={cn('transition-transform', isCollapsed ? '' : '-rotate-180')} />
            <span className="sr-only">{isCollapsed ? 'Show' : 'Hide'}</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'flex flex-col overflow-y-scroll border-t px-4 transition-[height]',
          isCollapsed ? 'h-0' : 'h-72',
        )}
      >
        {messages.map(message => (
          <ConsoleMessage key={message.id} message={message} isCollapsed={isCollapsed} />
        ))}
        <div className="mt-2" />
      </div>
    </div>
  )
}

function isErrorValue(value: unknown): value is { __isError: true, message?: unknown, stack?: unknown } {
  return typeof value === 'object' && value !== null && '__isError' in value && value.__isError === true
}

function isTraceValue(value: unknown): value is { __isTrace: true, stack?: unknown } {
  return typeof value === 'object' && value !== null && '__isTrace' in value && value.__isTrace === true
}

function ConsoleMessage({
  message: { parts, type },
  inHeader = false,
  isCollapsed,
}: {
  message: ConsoleEntry
  inHeader?: boolean
  isCollapsed: boolean
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-3 overflow-clip rounded-md border px-3 py-2 text-xs',
        type === 'error'
          ? 'bg-red-500/10 text-red-500'
          : type === 'warn'
            ? 'bg-yellow-500/10 text-yellow-500'
            : '',
        inHeader ? 'grow transition-opacity' : 'mt-2',
        inHeader && !isCollapsed ? 'opacity-0' : '',
      )}
    >
      <div className="flex items-center gap-2">

        {type === 'error'
          ? <CircleXIcon size={14} />
          : type === 'warn' && <TriangleAlertIcon size={14} />}
      </div>

      <div className="font-mono whitespace-pre-wrap">
        {parts.map((part, index) => (
          <Fragment key={part.key}>
            {index > 0 && ' '}
            {isErrorValue(part.value)
              ? (
                  <>
                    <span className="font-bold">{String(part.value.message ?? '').trim()}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {String(part.value.stack ?? '')}
                    </span>
                  </>
                )
              : isTraceValue(part.value)
                ? (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {String(part.value.stack ?? '')}
                    </span>
                  )
                : formatConsoleValue(part.value)}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
