<script lang="ts">
  import { haptic } from "ios-haptics";
  import { useIsMobile } from "../hooks.svelte";
  import type { LangUnion } from "../types";

  let { currentTab = $bindable() }: { currentTab: LangUnion } = $props();

  const isMobile = useIsMobile();
</script>

<div
  class={`${
    !isMobile && "border"
  } flex relative border-zinc-700 p-1 rounded-xl isolate overflow-clip`}
>
  <span
    class="top-1 bottom-1 left-1 -z-10 absolute bg-zinc-700 rounded-lg w-24 transition-[left]"
    style={`left: ${
      currentTab === "html"
        ? ".25rem"
        : currentTab === "css"
        ? "6.25rem"
        : currentTab === "js"
        ? "12.25rem"
        : 0
    }`}
  ></span>
  {@render langButton("html", "#ff5733")}
  {@render langButton("css", "rebeccapurple")}
  {@render langButton("js", "#f7df1e")}
</div>

{#snippet langButton(lang: LangUnion, color: string)}
  <button
    onclick={() => {
      if (currentTab !== lang) {
        haptic();
        window.location.hash = "#" + lang;
        currentTab = lang;
      }
    }}
    class="flex justify-center items-center gap-2 py-1.5 rounded-lg w-24 font-medium text-sm uppercase cursor-pointer"
    data-lang={lang}
  >
    <span
      class="rounded-full size-2.5"
      style={`background-color: ${color}`}
    >
    </span>
    {lang}
  </button>
{/snippet}
