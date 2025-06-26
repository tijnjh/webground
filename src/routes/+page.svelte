<script lang="ts">
  import { decode } from "$lib/codec";
  import Editor from "$lib/components/Editor.svelte";
  import LangSwitcher from "$lib/components/LangSwitcher.svelte";
  import Preview, { updatePreview } from "$lib/components/Preview.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { µ } from "$lib/global.svelte";
  import type { Code } from "$lib/types";
  import {
    checkIfShared,
    extractCodeParams,
    isMobile,
    setTabFromHash,
  } from "$lib/utils";
  import { ChevronUpIcon } from "@lucide/svelte";
  import { haptic } from "ios-haptics";
  import { ok, Result } from "neverthrow";
  import { Pane, PaneGroup, PaneResizer } from "paneforge";
  import { onMount } from "svelte";

  let showMobilePreview = $state(false);

  const isShared = checkIfShared().unwrapOr(false);

  onMount(() => {
    if (isShared) {
      const params = extractCodeParams();

      if (params.isErr()) {
        return;
      }

      const { h, c, j } = params.value;

      const decoded = Result.combine([
        h ? decode(h) : ok(""),
        c ? decode(c) : ok(""),
        j ? decode(j) : ok(""),
      ]);

      if (decoded.isErr()) {
        return;
      }

      const [html, css, js] = decoded.value;

      µ.code = { html, css, js };
    } else {
      if (localStorage.code) {
        for (const [key, val] of Object.entries(
          JSON.parse(localStorage.code),
        )) {
          µ.code[key as keyof Code] = val as string;
        }
      }
    }

    setTabFromHash(µ.currentTab, µ.code);
  });
</script>

<svelte:window
  onhashchange={() => void setTabFromHash(µ.currentTab, µ.code)}
  onkeydown={(e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      updatePreview(µ.code);
    }
  }}
/>

{#if !isMobile}
  <!-- desktop layout -->
  <PaneGroup direction="horizontal">
    <Pane defaultSize={50} class="h-svh">
      <Editor />
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
    <Editor />

    <div
      class="flex justify-between items-center bg-[#1e1e1e] pr-2 border-zinc-700 border-t"
    >
      <LangSwitcher />
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
