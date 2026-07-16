import Monaco from '@monaco-editor/react'
import { useAtomValue } from 'jotai'
import { useTheme } from 'next-themes'
import { useCodeStore } from '#lib/atoms/code'
import { selectedTabAtom } from '#lib/atoms/globals'
import { useIsShared } from '#lib/hooks'
import { MenuBar } from './menu-bar'

export function Editor() {
  const selectedTab = useAtomValue(selectedTabAtom)
  const isShared = useIsShared()
  const { code, setCode } = useCodeStore()
  const { resolvedTheme } = useTheme()

  const lang = selectedTab === 'js' ? 'javascript' : selectedTab

  return (
    <div
      className="relative h-full overflow-hidden dark:bg-[#1e1e1e]"
    >
      <MenuBar />

      <div className="relative isolate h-full *:absolute *:inset-0 *:h-full *:transition-[filter] *:duration-500">
        <Monaco
          className="absolute inset-0"
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
          onChange={value => setCode({ ...code, [selectedTab]: value })}
          value={code[selectedTab]}
          language={lang}
          options={{
            readOnly: isShared,
            value: code[selectedTab],
            language: lang,
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
    </div>
  )
}
