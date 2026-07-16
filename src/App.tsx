import type { Code } from '#lib/types'
import { Button } from '@base-ui/react'
import { Effect } from 'effect'
import { hapticTrigger } from 'ios-haptics'
import { useAtomValue } from 'jotai'
import { ChevronUpIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useEventListener } from 'usehooks-ts'
import { Console } from '#components/console'
import { Editor } from '#components/editor'
import { LangSwitcher } from '#components/lang-switcher'
import { Preview, usePreview } from '#components/preview'
import { RunButton } from '#components/run-button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#components/ui/resizable'
import { useCodeStore } from '#lib/atoms/code'
import { selectedTabAtom } from '#lib/atoms/globals'
import { decode } from '#lib/codec'
import { useIsMobile, useIsShared } from '#lib/hooks'
import { cn, extractCodeParams, localStore, setTabFromHash } from '#lib/utils'

export function App() {
  const { code, setCode } = useCodeStore()
  const selectedTab = useAtomValue(selectedTabAtom)

  const isMobile = useIsMobile()
  const isShared = useIsShared()

  const { updatePreview } = usePreview()

  const [showMobilePreview, setShowMobilePreview] = useState(false)

  useEffect(() => {
    const fn = async () => {
      if (isShared) {
        const { h, c, j } = extractCodeParams()

        const decoded = await Effect.runPromiseExit(
          Effect.all(
            [
              h ? decode(h) : Effect.succeed(''),
              c ? decode(c) : Effect.succeed(''),
              j ? decode(j) : Effect.succeed(''),
            ],
            { concurrency: 3 },
          ),
        )

        if (decoded._tag === 'Failure') {
          toast.error(decoded.cause.reasons.map(r => r.toString()).join(', '))
          console.error(decoded.cause)
          return
        }

        const [html, css, js] = decoded.value

        setCode({ html, css, js })
      }
      else {
        const codeResult = await Effect.runPromiseExit(localStore<Code>('code') || {})

        if (codeResult._tag === 'Success') {
          const code = codeResult.value
          for (const [key, val] of Object.entries(code)) {
            setCode(prev => ({ ...prev, [key]: val }))
          }
        }
        else {
          console.error('Failed to retrieve code from localStorage:', codeResult.cause)
        }
      }

      setTabFromHash(selectedTab, code)
    }

    fn()
  // eslint-disable-next-line react/exhaustive-deps
  }, [])

  useEventListener('hashchange', () => {
    setTabFromHash(selectedTab, code)
  })

  useEventListener('keydown', async (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter')) {
      e.preventDefault()
      await Effect.runPromise(updatePreview())
    }
  })

  if (!isMobile) {
    return (
      <ResizablePanelGroup>
        <ResizablePanel>
          <Editor />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel>
          <div className="flex h-full flex-col">
            <Preview className="size-full grow" />
            <Console />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return (
    <>

      <div className="grid h-dvh grid-rows-[1fr_min-content]">
        <Editor />

        <LangSwitcher className="fixed bottom-20 left-4 bg-white dark:bg-[#1e1e1e]" />

        <div className="flex items-center justify-between border-t bg-white p-4 dark:bg-[#1e1e1e]">
          <Button
            ref={hapticTrigger}
            onClick={() => {
              setShowMobilePreview(prev => !prev)
            }}
          >
            <div
              className={cn(
                'transition-transform',
                showMobilePreview && 'rotate-x-180',
              )}
            >
              <ChevronUpIcon />
            </div>
            Preview
          </Button>
          <RunButton />
        </div>
      </div>

      {showMobilePreview && (
        <div className="fixed top-17 bottom-17 isolate flex w-full flex-col">
          <Preview className="grow" />
          <Console />
        </div>
      )}
    </>
  )
}
