import { Effect } from "effect";
import { encode } from "./codec";
import type { Code } from "./types";

export const copyLink = ({
  code,
  mode,
  title,
}: {
  code: Code;
  mode: "full" | "markdown" | "html";
  title: string;
}): Effect.Effect<{ isLong: boolean }, Error> =>
  Effect.gen(function* () {
    const [html, css, js] = yield* Effect.all([
      encode(code.html),
      encode(code.css),
      encode(code.js),
    ]);

    const params = new URLSearchParams();

    if (code.html) params.set("h", html);
    if (code.css) params.set("c", css);
    if (code.js) params.set("j", js);

    const newUrl = `${origin}?${params.toString()}`;

    switch (mode) {
      case "full":
        navigator.clipboard.writeText(newUrl);
        break;
      case "markdown":
        navigator.clipboard.writeText(`[${title}](${newUrl})`);
        break;
      case "html":
        navigator.clipboard.writeText(`<a href="${newUrl}">${title}</a>`);
        break;
      default:
        return yield* Effect.fail(
          new Error(`copy link type "${mode}" is not supported.`),
        );
    }

    return {
      isLong: newUrl.length > 2048,
    };
  });
