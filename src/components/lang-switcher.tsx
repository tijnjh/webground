import type { LangUnion } from '#lib/types'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { selectedTabAtom } from '#lib/atoms/globals'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

export function LangSwitcher({ className }: { className?: string }) {
  const hash = String(location.hash).replace('#', '') // maybe not needed to wrap with string?
  const validHash: LangUnion = hash === 'html' || hash === 'css' || hash === 'js' ? hash : 'html'

  const [value, setValue] = useState<LangUnion>(validHash)

  const setSelectedTab = useSetAtom(selectedTabAtom)

  useEffect(() => {
    location.hash = `#${value}`
    setSelectedTab(value)
  }, [value, setSelectedTab])

  return (
    <ToggleGroup
      variant="outline"
      value={[value]}
      onValueChange={([next], details) => {
        if (next !== 'html' && next !== 'css' && next !== 'js') {
          details.cancel()
          return
        }

        setValue(next)
      }}
      className={className}
      spacing={0}
    >
      <LangTab lang="html" />
      <LangTab lang="css" />
      <LangTab lang="js" />
    </ToggleGroup>
  )
}

function LangTab({ lang }: { lang: LangUnion }) {
  return (
    <ToggleGroupItem
      value={lang}
      className="px-6 font-mono w-16"
    >
      {lang}
    </ToggleGroupItem>
  )
}
