import type { LangUnion } from '#lib/types'
import Monaco from '@monaco-editor/react'
import { useAtomValue } from 'jotai'
import { useTheme } from 'next-themes'
import { useCodeStore } from '#lib/atoms/code'
import { selectedTabAtom } from '#lib/atoms/globals'
import { useIsShared } from '#lib/hooks'
import { MenuBar } from './menu-bar'

export function Editor() {
  const selectedTab = useAtomValue(selectedTabAtom)
  const { code, setCode } = useCodeStore()

  return (
    <div
      className="relative h-full overflow-hidden dark:bg-[#1e1e1e]"
    >
      <MenuBar />

      <div className="relative isolate h-full *:absolute *:inset-0 *:h-full *:transition-[filter] *:duration-500">
        {(['html', 'css', 'js'] as const).map(lang => (
          <div
            key={lang}
            aria-hidden={selectedTab !== lang}
            className={selectedTab === lang ? 'visible z-10' : 'invisible pointer-events-none'}
          >
            <LangEditor
              lang={lang}
              setCodeByLang={value => setCode(current => ({
                ...current,
                [lang]: value,
              }))}
              codeByLang={code[lang]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LangEditor({
  lang,
  codeByLang,
  setCodeByLang,
}: {
  lang: LangUnion
  codeByLang: string
  setCodeByLang: (code: string) => void
}) {
  const { resolvedTheme } = useTheme()
  const isShared = useIsShared()

  const language = lang === 'js' ? 'javascript' : lang

  return (
    <Monaco
      className="absolute inset-0"
      theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
      path={`file:///${lang}`}
      onChange={value => value !== undefined && setCodeByLang(value)}
      value={codeByLang}
      language={language}
      options={{
        readOnly: isShared,
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
  )
}
