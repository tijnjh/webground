import type { LangUnion } from '#lib/types'
import { atom } from 'jotai'

export const selectedTabAtom = atom<LangUnion>('html')
export const previewSrcAtom = atom('/start.html')
