import { browser } from "$app/environment";
import type { Code } from "./types";

export function clearCode(code: Code) {
  for (const key of Object.keys(code)) {
    code[key as keyof Code] = "";
  }
}

const mediaQuery = browser ? matchMedia("(max-width: 768px)") : null;
export const isMobile = mediaQuery?.matches;

export function checkIfShared() {
  if (!browser) return;

  const url = new URL(location.href);

  const params = url.searchParams;
  const h = params.get("h");
  const c = params.get("c");
  const j = params.get("j");
  return !!(h || c || j);
}
