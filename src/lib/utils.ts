import type { ClassValue } from 'clsx'
import type { Code, LangUnion } from './types'
import { clsx } from 'clsx'
import { Effect } from 'effect'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const localStore = Effect.fn(function* <T>(key: string, newValue?: T) {
  if (newValue !== undefined) {
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  const item = localStorage.getItem(key)

  if (!item) {
    return yield* Effect.fail(new Error(`failed to find item with key ${key}`))
  }

  return JSON.parse(item) as T
})

export function extractCodeParams() {
  const params = new URL(location.href).searchParams

  const h = params.get('h')
  const c = params.get('c')
  const j = params.get('j')

  return { h, c, j }
}

export function setTabFromHash(currentTab: LangUnion, code: Code) {
  const hash = location.hash.replace('#', '')

  if (Object.keys(code).includes(hash)) {
    currentTab = hash as keyof Code
  }
}
