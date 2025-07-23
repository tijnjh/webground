import type { Code, LangUnion } from './types'
import { browser } from '$app/environment'
import { Micro } from 'effect'

export function localStore<T>(key: string, newValue?: T) {
  return Micro.gen(function* () {
    if (newValue !== undefined) {
      localStorage.setItem(key, JSON.stringify(newValue))
    }

    const item = localStorage.getItem(key)

    if (!item) {
      return yield* Micro.fail(new Error(`failed to find item with key ${key}`))
    }

    return JSON.parse(item) as T
  })
}

export function extractCodeParams() {
  if (!browser) {
    return { h: '', c: '', j: '' }
  }

  const params = new URL(location.href).searchParams

  const h = params.get('h')
  const c = params.get('c')
  const j = params.get('j')

  return { h, c, j }
}

export function setTabFromHash(currentTab: LangUnion, code: Code) {
  if (!browser)
    return

  const hash = location.hash.replace('#', '')

  if (Object.keys(code).includes(hash)) {
    currentTab = hash as keyof Code
  }
}

export { cn } from 'cnfn'

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null }
