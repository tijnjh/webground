import type { Code } from '#lib/types'
import { atom, useAtomValue, useSetAtom } from 'jotai'

const emptyCode = (): Code => ({ html: '', css: '', js: '' })

const codeStateAtom = atom<Code>(emptyCode())

export function useCodeStore() {
  const setCode = useSetAtom(codeStateAtom)

  return {
    code: useAtomValue(codeStateAtom),
    setCode,
    clearCode: () => setCode(emptyCode()),
  }
}
