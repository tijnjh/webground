<script lang="ts" module>
  import type { Code } from "../types";
  import { isMobile, template } from "../helpers";

  let src = $state("/start.html");

  export function updatePreview(code: Code) {
    if (Object.values(code).every((value) => value.trim() === "")) {
      src = "/start.html";
      return;
    }
    const url = URL.createObjectURL(
      new Blob([template(code)], { type: "text/html" }),
    );

    src = url;

    localStorage.code = JSON.stringify(code);
  }
</script>

<div class={isMobile ? "top-[68px] fixed inset-x-0 bottom-12 z-50" : "h-full"}>
  <iframe
    {src}
    title="preview"
    class="bg-white border-0 size-full"
    referrerpolicy="no-referrer"
    sandbox="allow-modals allow-downloads allow-scripts allow-forms"
  >
  </iframe>
</div>
