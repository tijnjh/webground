import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";
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

export function encode(str: string) {
  let encoded;
  encoded = str;
  encoded = strToU8(str);
  encoded = deflateSync(encoded);
  encoded = btoa(String.fromCharCode.apply(null, [...encoded]));
  encoded = encoded.replace(/=/g, "").replace(/\+/g, "~").replace(/\//g, "_");
  return encoded;
}

export function decode(str: string) {
  let decoded;
  decoded = str;
  decoded = padBase64(decoded);
  decoded = decoded.replace(/\~/g, "+").replace(/_/g, "/");
  decoded = atob(decoded);
  decoded = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
  decoded = inflateSync(decoded);
  decoded = strFromU8(decoded);
  return decoded;
}

export function padBase64(input: string) {
  var segmentLength = 4;
  var stringLength = input.length;
  var diff = stringLength % segmentLength;

  if (!diff) {
    return input;
  }

  var padLength = segmentLength - diff;
  var paddedStringLength = stringLength + padLength;
  var buffer = input;

  while (padLength--) {
    buffer += "=";
  }
  return buffer.toString();
}

export function clearCode(code: Code) {
  for (const [key, val] of Object.entries(code)) {
    code[key as keyof Code] = "";
  }
}
