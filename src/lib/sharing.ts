import type { Code } from './types'
import { browser } from '$app/environment'
import { Micro } from 'effect'
import { TaggedError as TaggedErr } from 'effect/Data'
import { encode } from './codec'

export class CopyLinkError extends TaggedErr('CopyLinkError')<{ message: string }> {}

export function createShareUrl(code: Code) {
  return Micro.gen(function* () {
    const [html, css, js] = yield* Micro.all([
      encode(code.html),
      encode(code.css),
      encode(code.js),
    ])

    const url = new URL(browser ? location.origin : 'http://localhost:5173')

    if (code.html)
      url.searchParams.set('h', html)
    if (code.css)
      url.searchParams.set('c', css)
    if (code.js)
      url.searchParams.set('j', js)

    return url
  })
}

function createShareableString(url: URL, mode: 'full' | 'markdown' | 'html', title: string): Micro.Micro<string, CopyLinkError> {
  return Micro.gen(function* () {
    const urlString = url.toString()
    switch (mode) {
      case 'full':
        return urlString
      case 'markdown':
        return `[${title}](${urlString})`
      case 'html':
        return `<a href="${urlString}">${title}</a>`
      default:
        return yield* Micro.fail(new CopyLinkError({ message: `copy link type "${mode}" is not supported.` }))
    }
  })
}

export function copyLink({
  code,
  mode,
  title,
}: {
  code: Code
  mode: 'full' | 'markdown' | 'html'
  title: string
}) {
  return Micro.gen(function* () {
    const url = yield* createShareUrl(code)
    const shareableString = yield* createShareableString(url, mode, title)

    yield* Micro.tryPromise({
      try: () => navigator.clipboard.writeText(shareableString),
      catch: () => new CopyLinkError({ message: 'Failed to copy to clipboard' }),
    })

    return {
      isLong: url.toString().length > 2048,
    }
  })
}
