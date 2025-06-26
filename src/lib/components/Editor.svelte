<script lang="ts">
  import { µ } from "$lib/global.svelte";
  import { checkIfShared } from "$lib/utils";
  import type { LangUnion } from "../types";
  import MenuBar from "./MenuBar.svelte";
  import Monaco from "./Monaco.svelte";

  const isShared = checkIfShared().unwrapOr(false);
</script>

<div class="relative grid grid-rows-[min-content_1fr] dark:bg-[#1e1e1e] h-full overflow-hidden width-screen">
  <MenuBar />

  <div class="isolate *:absolute relative *:inset-0 *:h-full *:transition-[filter] *:duration-500">
    {@render monaco("html")}
    {@render monaco("css")}
    {@render monaco("js")}
  </div>
</div>

{#snippet monaco(lang: LangUnion)}
  {@const language = lang === "js" ? "javascript" : lang}

  <div style={`z-index: ${µ.currentTab === lang ? "100" : "0"}`}>
    <Monaco bind:value={µ.code[lang]} {language} readOnly={isShared} />
  </div>
{/snippet}
