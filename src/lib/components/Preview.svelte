<script lang="ts" module>
  import { template } from "$lib/preview/template";
  import { cn } from "$lib/utils";
  import type { Code } from "../types";

  let src = $state("/start.html");

  export function updatePreview(code: Code) {
    if (Object.values(code).every((value) => value.trim() === "")) {
      src = "/start.html";
      return false;
    }
    const url = URL.createObjectURL(
      new Blob([template(code)], { type: "text/html" }),
    );

    src = url;

    localStorage.code = JSON.stringify(code);

    return true;
  }
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
