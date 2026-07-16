import Monaco from '@monaco-editor/react'
import { useAtomValue } from 'jotai'
import { useCodeStore } from '#lib/atoms/code'
import { selectedTabAtom } from '#lib/atoms/globals'
import { useIsShared } from '#lib/hooks'

export function Editor() {
  const selectedTab = useAtomValue(selectedTabAtom)
  const isShared = useIsShared()

  const { code } = useCodeStore()

  return (
    <div
      className="width-screen relative grid h-full grid-rows-[min-content_1fr] overflow-hidden dark:bg-[#1e1e1e]"
    >
      <div className="relative isolate *:absolute *:inset-0 *:h-full *:transition-[filter] *:duration-500">

        {[['html'], ['css'], ['js', 'javascript']].map(([lang, language]) =>
          selectedTab === lang && (
            <div key={lang}>
              <Monaco
                className="absolute inset-0"
                options={{
                  readOnly: isShared,
                  value: code[lang],
                  language: language ?? lang,
                  // theme: @todo
                  overviewRulerLanes: 0,
                  overviewRulerBorder: false,
                  automaticLayout: true,
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  fontSize: 13,
                  minimap: { enabled: false },
                  tabSize: 2,
                  fontFamily: 'MonoLisaCode',
                  fontLigatures: true,
                }}
              />
            </div>
          ),
        )}
      </div>
    </div>
  )
}
