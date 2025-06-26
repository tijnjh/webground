import { browser } from "$app/environment";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Code, LangUnion } from "./types";

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

export function setTabFromHash(currentTab: LangUnion, code: Code) {
  if (!browser) return;

  const hash = window.location.hash.replace("#", "");

  if (Object.keys(code).includes(hash)) {
    currentTab = hash as keyof Code;
  }
}

export function extractCodeParams(url: string) {
  const params = new URL(url).searchParams;

  const h = params.get("h");
  const c = params.get("c");
  const j = params.get("j");

  return { h, c, j };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};
