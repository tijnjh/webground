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
        <script>${js}</script>
    </body>
    </html>
`;

export function clearCode(code: Code) {
  for (const key of Object.keys(code)) {
    code[key as keyof Code] = "";
  }
}
