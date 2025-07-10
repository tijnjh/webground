import type { Code } from '$lib/types'
import console from './console?raw'

export function template({ css, html, js }: Code) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${css}
        </style>
        <script defer>
          ${console}
        </script>
        <script defer type="module">
          ${js}
        </script>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `
}
