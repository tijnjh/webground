import { browser } from '$app/environment'

export function useIsMobile() {
  if (!browser)
    return false

  const mediaQuery = matchMedia('(max-width: 768px)')

  let isMobile = $state(mediaQuery.matches)

  window.onresize = () => void (isMobile = mediaQuery.matches)

  return isMobile
}

export function useIsShared() {
  if (!browser)
    return false

  const params = new URL(location.href).searchParams

  function check() {
    const h = params.get('h')
    const c = params.get('c')
    const j = params.get('j')

    return Boolean(h || c || j)
  }

  const isShared = $state(check())

  return isShared
}
