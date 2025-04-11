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
  const encoded: Record<"html" | "css" | "js", string> = { ...code };
  for (const [key, val] of Object.entries(code)) {
    encoded[key as "html" | "css" | "js"] = encode(val);
  }

  const currentURL = window.location.href.split("?")[0];
  const newUrl = encoded
    ? `${currentURL}?h=${encoded.html}&c=${encoded.css}&j=${encoded.js}`
    : currentURL;

  if (newUrl.length > 2048) {
    toast.error(
      `Code too long! max length: 2048, your length: ${newUrl.length}`
    );
    return;
  }

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
  } catch (err) {
    const msg = "Failed to copy to clipboard " + err;
    toast.error(msg);
    throw new Error(msg);
  }
}
