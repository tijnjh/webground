import { toast } from "svelte-sonner";
import { decode, encode } from "./helpers";
import type { Code } from "./types";

export function checkParams(url: string, code: Code) {
  const params = new URL(url).searchParams;

  const html = params.get("h");
  const css = params.get("c");
  const js = params.get("j");

  code.html = html ? decode(html) : "";
  code.css = css ? decode(css) : "";
  code.js = js ? decode(js) : "";

  if (html || css || js) {
    return true;
  } else {
    return false;
  }
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

  if (code.html) params.set("h", encode(code.html));
  if (code.css) params.set("c", encode(code.css));
  if (code.js) params.set("j", encode(code.js));

  let newUrl = `${origin}?${params.toString()}`;

  try {
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
  } catch (err) {
    const msg = "Failed to copy to clipboard " + err;
    toast.error(msg);
    throw new Error(msg);
  }
}
