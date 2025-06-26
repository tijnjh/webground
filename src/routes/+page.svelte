<script lang="ts">
  import { decode } from "$lib/codec";
  import Editor from "$lib/components/Editor.svelte";
  import LangSwitcher from "$lib/components/LangSwitcher.svelte";
  import Preview, { updatePreview } from "$lib/components/Preview.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    checkIfShared,
    extractCodeParams,
    isMobile,
    setTabFromHash,
  } from "$lib/utils";
  import type { Code, LangUnion } from "$lib/types";
  import { ChevronUpIcon } from "@lucide/svelte";
  import { haptic } from "ios-haptics";
  import { Pane, PaneGroup, PaneResizer } from "paneforge";
  import { onMount } from "svelte";

  let currentTab: LangUnion = $state("html");
  let showMobilePreview = $state(false);

  let code: Code = $state({ html: "", css: "", js: "" });

  const isShared = checkIfShared();

  onMount(() => {
    if (isShared) {
      const { h, c, j } = extractCodeParams(location.href);

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

    setTabFromHash(currentTab, code);
  });
</script>

<svelte:window
  onhashchange={() => void setTabFromHash(currentTab, code)}
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
      <Button
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
      </Button>
    </div>
  </div>

  {#if showMobilePreview}
    <Preview />
  {/if}
{/if}
