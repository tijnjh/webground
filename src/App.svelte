<script lang="ts">
  import { Toaster } from "svelte-sonner";
  import { Pane, PaneGroup, PaneResizer } from "paneforge";
  import { ChevronUpIcon } from "@lucide/svelte";
  import { onMount } from "svelte";

  import type { Code, LangUnion } from "./lib/types";
  import Preview, { updatePreview } from "./lib/components/Preview.svelte";
  import Editor from "./lib/components/Editor.svelte";
  import LangSwitcher from "./lib/components/LangSwitcher.svelte";
  import { haptic } from "ios-haptics";
  import { isMobile, isShared } from "./lib/helpers";
  import { decode } from "./lib/codec";

  let currentTab: LangUnion = $state("html");
  let showMobilePreview = $state(false);

  let code: Code = $state({
    html: "",
    css: "",
    js: "",
  });

  function setTabFromHash() {
    const hash = window.location.hash.replace("#", "");

    if (Object.keys(code).includes(hash)) {
      currentTab = hash as keyof Code;
    }
  }

  onMount(() => {
    if (isShared) {
      const params = new URL(location.href).searchParams;

      const h = params.get("h");
      const c = params.get("c");
      const j = params.get("j");

      code = {
        html: h ? decode(h) : "",
        css: c ? decode(c) : "",
        js: j ? decode(j) : "",
      };
    } else {
      if (localStorage.code) {
        for (
          const [key, val] of Object.entries(
            JSON.parse(localStorage.code),
          )
        ) {
          code[key as keyof Code] = val as string;
        }
      }
    }

    setTabFromHash();
    window.addEventListener("hashchange", setTabFromHash);
    return () => window.removeEventListener("hashchange", setTabFromHash);
  });
</script>

<svelte:window
  onkeydown={(e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      updatePreview(code);
    }
  }}
/>

{#if !isMobile}
  <!-- desktop layout -->
  <PaneGroup direction="horizontal">
    <Pane defaultSize={50} class="h-svh">
      <Editor bind:code {currentTab} />
    </Pane>

    <PaneResizer class="place-items-center grid bg-zinc-800 w-4">
      <span class="bg-zinc-600 rounded-full w-1 h-12"></span>
    </PaneResizer>

    <Pane defaultSize={50}>
      <Preview />
    </Pane>
  </PaneGroup>
{:else}
  <!-- mobile layout -->
  <div class="grid grid-rows-[1fr_3rem] h-svh">
    <Editor bind:code {currentTab} />

    <div class="flex justify-between items-center bg-[#1e1e1e] pr-2 border-zinc-700 border-t">
      <LangSwitcher bind:currentTab />
      <button
        onclick={() => {
          haptic();
          showMobilePreview = !showMobilePreview;
        }}
        class="bg-white text-black btn"
      >
        <div
          class="transition-transform"
          class:rotate-x-180={showMobilePreview}
        >
          <ChevronUpIcon />
        </div>
        Preview
      </button>
    </div>
  </div>

  {#if showMobilePreview}
    <Preview />
  {/if}
{/if}

<Toaster richColors />
