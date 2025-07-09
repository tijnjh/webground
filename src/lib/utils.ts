import type { ClassValue } from 'clsx'
import type { Code, LangUnion } from './types'
import { browser } from '$app/environment'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function extractCodeParams() {
  if (!browser) {
    return { h: '', c: '', j: '' }
  }

  const params = new URL(location.href).searchParams

  const h = params.get('h') ?? undefined
  const c = params.get('c') ?? undefined
  const j = params.get('j') ?? undefined

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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null }
