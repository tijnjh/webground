import type { Code } from './types'
import { Micro } from 'effect'
import { TaggedError as TaggedErr } from 'effect/Data'
import { encode } from './codec'

export class CopyLinkError extends TaggedErr('CopyLinkError')<{ message: string }> {}

export function copyLink({
  code,
  mode,
  title,
}: {
  code: Code
  mode: 'full' | 'markdown' | 'html'
  title: string
}): Micro.Micro<{ isLong: boolean }, Error> {
  return Micro.gen(function* () {
    const [html, css, js] = yield* Micro.all([
      encode(code.html),
      encode(code.css),
      encode(code.js),
    ])

    const params = new URLSearchParams()

    if (code.html)
      params.set('h', html)
    if (code.css)
      params.set('c', css)
    if (code.js)
      params.set('j', js)

    const newUrl = `${origin}?${params.toString()}`

    switch (mode) {
      case 'full':
        navigator.clipboard.writeText(newUrl)
        break
      case 'markdown':
        navigator.clipboard.writeText(`[${title}](${newUrl})`)
        break
      case 'html':
        navigator.clipboard.writeText(`<a href="${newUrl}">${title}</a>`)
        break
      default:
        return yield* Micro.fail(new CopyLinkError({ message: `copy link type "${mode}" is not supported.` }))
    }

    return {
      isLong: newUrl.length > 2048,
    }
  })
}
