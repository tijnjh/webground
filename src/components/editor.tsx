import Monaco from '@monaco-editor/react'
import { useAtomValue } from 'jotai'
import { selectedTabAtom } from '#lib/atoms/globals'
import { useIsShared } from '#lib/hooks'

export function Editor() {
  const selectedTab = useAtomValue(selectedTabAtom)
  const isShared = useIsShared()

  return (
    <div
      className="width-screen relative grid h-full grid-rows-[min-content_1fr] overflow-hidden dark:bg-[#1e1e1e]"
    >
      <div className="relative isolate *:absolute *:inset-0 *:h-full *:transition-[filter] *:duration-500">

        {[['html'], ['css'], ['js', 'javascript']].map(([lang, language]) =>
          selectedTab === lang && (
            <div key={lang}>
              <Monaco language={language ?? lang} options={{ readOnly: isShared }} />
            </div>
          ),
        )}
      </div>
    </div>
  )
}
