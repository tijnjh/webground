import type { ConsoleAction } from '#lib/types'
import { CheckIcon, ChevronUpIcon, CircleXIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

import { cn } from '#lib/utils'
import { Button } from './ui/button'

export function Console() {
  const [messages, setMessages] = useState<ConsoleAction[]>([])
  const [isCollapsed, setIsCollapsed] = useState(true)

  const messageCounts = {
    log: messages.filter(m => m.type === 'log').length,
    warn: messages.filter(m => m.type === 'warn').length,
    error: messages.filter(m => m.type === 'error').length,
  }

  function toggle() {
    setIsCollapsed(prev => !prev)
  }

  useEventListener('message', (event: MessageEvent) => {
    const data = event.data as ConsoleAction

    if (data.__webground) {
      setMessages(previous => [data, ...previous])
    }
  })

  useEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
      event.preventDefault()
      toggle()
    }
  })

  const [cleared, setCleared] = useState(false)

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
              setMessages([])
              setCleared(true)
              setTimeout(setCleared, 2000, false)
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
          <ConsoleMessage key={message.data[0]} message={message} isCollapsed={isCollapsed} />
        ))}
        <div className="mt-2" />
      </div>
    </div>
  )
}

function ConsoleMessage({
  message: { data, type },
  inHeader = false,
  isCollapsed,
}: {
  message: ConsoleAction
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
        {data.map(item => (
          <Fragment key={item}>
            {item?.__isError
              ? (
                  <>
                    <span className="font-bold">{item.message.trim()}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {item.stack}
                    </span>
                  </>
                )
              : item?.__isTrace
                ? (
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {item.stack}
                    </span>
                  )
                : JSON.stringify(item, null, 2)}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
