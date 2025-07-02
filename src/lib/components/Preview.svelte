<script lang="ts" module>
  import { template } from "$lib/preview/template";
  import { cn, localStore } from "$lib/utils";
  import { Effect } from "effect";
  import type { Code } from "../types";

  let src = $state("/start.html");

  // export function updatePreview(code: Code) {
  //   if (Object.values(code).every((value) => value.trim() === "")) {
  //     src = "/start.html";
  //     return false;
  //   }
  //   const url = URL.createObjectURL(
  //     new Blob([template(code)], { type: "text/html" }),
  //   );

  //   src = url;

  //   Effect.runSync(localStore("code", code));

  //   return true;
  // }

  export const updatePreview = (
    code: Code,
  ): Effect.Effect<{ didUpdate: boolean }, Error> =>
    Effect.gen(function* () {
      if (Object.values(code).every((v) => v.trim() === "")) {
        src = "/start.html";
        return { didUpdate: false };
      }

      const url = Effect.try({
        try: () => {
          const blob = new Blob([template(code)], { type: "text/html" });
          return URL.createObjectURL(blob);
        },
        catch: () => new Error("failed to create object url"),
      });

      src = yield* url;

      yield* localStore("code", code);

      return { didUpdate: true };
    });
</script>

<script lang="ts">
  let props: { class?: string } = $props();
</script>

<iframe
  {src}
  title="preview"
  class={cn("bg-white border-0", props.class)}
  referrerpolicy="no-referrer"
  sandbox="allow-modals allow-downloads allow-scripts allow-forms"
>
</iframe>
