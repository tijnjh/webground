import { browser } from "$app/environment";
import type { Code } from "./types";

export const template = ({
  css,
  html,
  js,
}: {
  css: string;
  html: string;
  js: string;
}) => `
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
    </head>
    <body>
        ${html}
        <script type="module">${js}</script>
    </body>
    </html>
`;

export function clearCode(code: Code) {
  for (const key of Object.keys(code)) {
    code[key as keyof Code] = "";
  }
}

const mediaQuery = browser ? matchMedia("(max-width: 768px)") : null;
export const isMobile = mediaQuery?.matches;

export function checkIfShared(url: URL) {
  const params = url.searchParams;
  const h = params.get("h");
  const c = params.get("c");
  const j = params.get("j");
  return !!(h || c || j);
}

export function checkIfCrawler(url: URL) {
  return /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|linkedinbot/i
    .test(url.searchParams.get("ua") || "");
}
