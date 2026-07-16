import type { ReactNode } from 'react'
import type { LinkShareUnion } from '#lib/types'
import { Effect } from 'effect'
import { CodeIcon, EllipsisIcon, LinkIcon, PencilIcon, ShareIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCodeStore } from '#lib/atoms/code'
import { useIsMobile, useIsShared } from '#lib/hooks'
import { copyLink } from '#lib/sharing'
import { localStore } from '#lib/utils'
import { AdaptivePanel, AdaptivePanelContent, AdaptivePanelTrigger } from './adaptive-panel'
import { AppearanceToggle } from './appearance-toggle'
import { LangSwitcher } from './lang-switcher'
import { RunButton } from './run-button'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export function MenuBar() {
  const isMobile = useIsMobile()
  const isShared = useIsShared()

  const [title, setTitle] = useState('')

  const { code, clearCode } = useCodeStore()

  return (
    <div className="flex items-center justify-between gap-2 p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <AdaptivePanel>
            <AdaptivePanelTrigger>
              <Button size="icon" variant="outline" aria-label="Toggle menu">
                <EllipsisIcon size={16} />
                <span className="sr-only">Menu</span>
              </Button>
            </AdaptivePanelTrigger>

            <AdaptivePanelContent popover={{ align: 'start' }}>
              <div className="flex flex-col gap-2">

                <div className="flex items-center justify-between">
                  <h1>Webground</h1>
                  <AppearanceToggle />
                </div>

                <Separator className="my-2" />

                <Button className="w-full" render={<a href="https://github.com/tijnjh/webground" />}>
                  <CodeIcon size={16} />
                  View source
                </Button>

                {!isShared && (
                  <>
                    <Separator className="my-2" />

                    <AdaptivePanel>
                      <AdaptivePanelTrigger>
                        <Button className="w-full" variant="destructive">
                          <Trash2Icon size={16} />
                          Clear all code
                        </Button>
                      </AdaptivePanelTrigger>
                      <AdaptivePanelContent popover={{ align: 'start' }}>

                        <p>Are you sure you want to your clear your code?</p>

                        <Separator />

                        <Button
                          className="w-full"
                          variant="destructive"
                          onClick={() => {
                            clearCode()
                            toast.success('Cleared code')
                          }}
                        >
                          Confirm
                        </Button>

                      </AdaptivePanelContent>
                    </AdaptivePanel>
                  </>
                )}
              </div>
            </AdaptivePanelContent>
          </AdaptivePanel>

          <AdaptivePanel>
            <AdaptivePanelTrigger>
              <Button variant="outline">
                <ShareIcon size={16} />
                Share
              </Button>
            </AdaptivePanelTrigger>
            <AdaptivePanelContent popover={{ align: 'start' }}>
              <div className="flex flex-col gap-2">
                <h3>Link sharing</h3>

                <Separator className="my-2" />

                <ShareButton mode="full" title={title}>Full URL</ShareButton>

                <Separator className="my-2" />

                <label className="mb-2 flex items-center justify-between gap-4">
                  <span>Title</span>
                  <input
                    type="text"
                    placeholder="Shared code"
                    className="min-w-0 text-right outline-none"
                    value={title}
                    onChange={e => setTitle(e.currentTarget.value)}
                  />
                </label>

                <ShareButton mode="markdown" title={title}>Markdown</ShareButton>
                <ShareButton mode="html" title={title}>HTML</ShareButton>

              </div>
            </AdaptivePanelContent>
          </AdaptivePanel>
        </div>
      </div>

      {!isMobile && (
        <LangSwitcher />
      )}

      <div className="flex items-center gap-2">
        {isShared && (
          <Button
            onClick={() => {
              Effect.runSync(localStore('code', code))
              location.href = location.href.split('?')[0]
            }}
          >
            <PencilIcon size={16} />
            Edit
          </Button>
        )}

        {!isMobile && (
          <RunButton />
        )}
      </div>
    </div>
  )
}

function ShareButton({
  mode,
  children,
  title,
}: {
  mode: LinkShareUnion
  children: ReactNode
  title: string
}) {
  const { code } = useCodeStore()

  return (
    <Button
      onClick={() => {
        Effect.runPromise(copyLink({ code, mode, title }))
          .then((res) => {
            toast.success(`Copied link (${mode}) to clipboard`)

            if (res.isLong) {
              setTimeout(() => {
                toast.warning(
                  'URL is longer than 2048 characters, which might cause issues in certain browsers',
                )
              }, 300)
            }
          })
          .catch((error) => {
            toast.error(error.message)
          })
      }}
      className="w-full"
    >
      <LinkIcon size={16} />
      {children}
    </Button>
  )
}
