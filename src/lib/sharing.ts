import type { Code } from './types'
import { err, ok, Result } from 'neverthrow'
import { encode } from './codec'

export function copyLink(code: Code, mode: 'full' | 'markdown' | 'html', title: string): Result<any, Error> {
  const encoded = Result.combine([
    encode(code.html),
    encode(code.css),
    encode(code.js),
  ])

  const params = new URLSearchParams()

  if (encoded.isErr()) {
    return err(new Error('Failed to encode'))
  }

  const [html, css, js] = encoded.value

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
      return err(new Error(`Copy link type "${mode}" is not supported.`),
      )
  }

  return ok({
    isLong: newUrl.length > 2048,
  })
}
