import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsShared() {
  const params = new URL(location.href).searchParams

  function check() {
    const h = params.get('h')
    const c = params.get('c')
    const j = params.get('j')

    return Boolean(h || c || j)
  }

  const [isShared] = useState(check)

  return isShared
}
