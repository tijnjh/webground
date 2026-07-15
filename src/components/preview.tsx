import { Effect } from 'effect'
import { useEffect, useState } from 'react'
import { useCodeStore } from '#lib/atoms/code'
import { template } from '#lib/preview/template'
import { cn, localStore } from '#lib/utils'

export function Preview({ className }: { className?: string }) {
  const { src } = usePreview()

  return (
    <iframe
      src={src}
      title="preview"
      className={cn('border-0 bg-white', className)}
      referrerPolicy="no-referrer"
      sandbox="allow-modals allow-downloads allow-scripts allow-forms"
    />
  )
}

export function usePreview() {
  const [src, setSrc] = useState('/start.html')

  useEffect(() => {
    return () => {
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src)
      }
    }
  }, [src])

  const { code } = useCodeStore()

  const updatePreview = Effect.fn(function* () {
    if (Object.values(code).every(v => v.trim() === '')) {
      setSrc('/start.html')
      return { didUpdate: false }
    }

    const url = Effect.try({
      try: () => {
        const blob = new Blob([template(code)], { type: 'text/html' })
        return URL.createObjectURL(blob)
      },
      catch: () => new Error('failed to create object url'),
    })

    setSrc(yield* url)

    yield* localStore('code', code)

    return { didUpdate: true }
  })

  return {
    src,
    updatePreview,
  }
}
