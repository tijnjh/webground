import type { Code } from '$lib/types'

export const codeState = new class {
  current: Code

  constructor() {
    this.current = $state({ html: '', css: '', js: '' })
  }

  clear() {
    this.current = { html: '', css: '', js: '' }
  }
}()
