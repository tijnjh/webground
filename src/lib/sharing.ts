import { encode } from "./codec";
import { Code } from "./types";

export function copyLink(
  code: Code,
  mode: "full" | "markdown" | "html",
  title: string,
) {
  const encoded = {
    html: encode(code.html),
    css: encode(code.css),
    js: encode(code.js),
  };

  const params = new URLSearchParams();

  if (code.html) params.set("h", encoded.html);
  if (code.css) params.set("c", encoded.css);
  if (code.js) params.set("j", encoded.js);

  const newUrl = `${origin}?${params.toString()}`;

  switch (mode) {
    case "full":
      navigator.clipboard.writeText(newUrl);
      break;
    case "markdown":
      navigator.clipboard.writeText(`[${title}](${newUrl})`);
      break;
    case "html":
      navigator.clipboard.writeText(
        `<a href="${newUrl}">${title}</a>`,
      );
      break;
    default:
      throw new Error(
        `Copy link type "${mode}" is not supported.`,
      );
  }

  if (newUrl.length > 2048) {
    throw new Error(
      "URL is longer than 2048 characters, which might cause issues in certain browsers",
    );
  }
}
