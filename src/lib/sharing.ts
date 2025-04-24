import { toast } from "svelte-sonner";
import { decode, encode } from "./helpers";
import { tryCatch } from "tsuite";

import type { Code } from "./types";

export function checkParams(url: string, code: Code) {
  const { h, c, j } = Object.fromEntries(new URL(url).searchParams);

  const [decoded, decodingErr] = tryCatch(() => ({
    html: h ? decode(h) : "",
    css: c ? decode(c) : "",
    js: j ? decode(j) : "",
  }));

  if (decodingErr || !decoded) {
    toast.error(`Failed to decode: ${decodingErr}`);
    return;
  }

  Object.assign(code, decoded);

  return !!(h || c || j);
}

export function share({
  mode,
  title,
  code,
}: {
  mode: "full" | "markdown" | "html";
  title: string;
  code: Code;
}) {
  const origin = new URL(location.href).origin;

  const params = new URLSearchParams();

  const [encoded, encodingErr] = tryCatch(() => ({
    html: encode(code.html),
    css: encode(code.css),
    js: encode(code.js),
  }));

  if (encodingErr || !encoded) {
    toast.error(`Failed to encode: ${encodingErr}`);
    return;
  }

  if (code.html) params.set("h", encoded.html);
  if (code.css) params.set("c", encoded.css);
  if (code.js) params.set("j", encoded.js);

  let newUrl = `${origin}?${params.toString()}`;

  const [, copyErr] = tryCatch(() => {
    switch (mode) {
      case "full":
        navigator.clipboard.writeText(newUrl);
        toast.success("Copied full link to clipboard");
        break;
      case "markdown":
        navigator.clipboard.writeText(`[${title}](${newUrl})`);
        toast.success("Copied markdown to clipboard");
        break;
      case "html":
        navigator.clipboard.writeText(`<a href="${newUrl}">${title}</a>`);
        toast.success("Copied HTML to clipboard");
        break;
      default:
        break;
    }

    if (newUrl.length > 2048) {
      setTimeout(() => {
        toast.warning(
          `URL is longer than 2048 characters, which might cause issues in certain browsers`
        );
      }, 200);
    }
  });

  if (copyErr) {
    const msg = `Failed to copy to clipboard: ${copyErr}`;
    toast.error(msg);
    throw new Error(msg);
  }
}
