import { browser } from "$app/environment";
import { type ClassValue, clsx } from "clsx";
import { err, ok, type Result } from "neverthrow";
import { twMerge } from "tailwind-merge";
import type { Code, LangUnion } from "./types";

export function clearCode(code: Code) {
  for (const key of Object.keys(code)) {
    code[key as keyof Code] = "";
  }
}

const mediaQuery = browser ? matchMedia("(max-width: 768px)") : null;
export const isMobile = mediaQuery?.matches;

export function checkIfShared(): Result<boolean, Error> {
  if (!browser) return err(new Error("not a browser"));

  const params = new URL(location.href).searchParams;

  const h = params.get("h");
  const c = params.get("c");
  const j = params.get("j");

  return ok(!!(h || c || j));
}

interface CodeParams {
  h?: string;
  c?: string;
  j?: string;
}

export function extractCodeParams(): Result<CodeParams, Error> {
  if (!browser) return err(new Error("not a browser"));

  const params = new URL(location.href).searchParams;

  const h = params.get("h") ?? undefined;
  const c = params.get("c") ?? undefined;
  const j = params.get("j") ?? undefined;

  return ok({ h, c, j });
}

export function setTabFromHash(currentTab: LangUnion, code: Code) {
  if (!browser) return;

  const hash = location.hash.replace("#", "");

  if (Object.keys(code).includes(hash)) {
    currentTab = hash as keyof Code;
  }
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
