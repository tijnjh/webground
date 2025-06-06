export function useIsMobile() {
  const mediaQuery = matchMedia("(max-width: 768px)");
  const isMobile = mediaQuery.matches;
  return isMobile;
}

export function useIsShared(url: string) {
  const params = new URL(url).searchParams;
  const h = params.get("h");
  const c = params.get("c");
  const j = params.get("j");
  return !!(h || c || j);
}
