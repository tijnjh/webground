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
  import { onMount } from "svelte";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import RunButton from "$lib/components/RunButton.svelte";

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
        for (
          const [key, val] of Object.entries(
            JSON.parse(localStorage.code),
          )
        ) {
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
  <Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane defaultSize={50} class="h-dvh">
      <Editor />
    </Resizable.Pane>

    <Resizable.Handle />

    <Resizable.Pane defaultSize={50}>
      <Preview />
    </Resizable.Pane>
  </Resizable.PaneGroup>
{:else}
  <!-- mobile layout -->
  <div class="grid grid-rows-[1fr_min-content] h-dvh">
    <Editor />

    <LangSwitcher class="bottom-20 left-2 fixed bg-white dark:bg-[#1e1e1e]" />

    <div class="flex justify-between items-center bg-white dark:bg-[#1e1e1e] p-4 border-t">
      <Button
        onclick={() => {
          haptic();
          showMobilePreview = !showMobilePreview;
        }}
      >
        <div
          class="transition-transform"
          class:rotate-x-180={showMobilePreview}
        >
          <ChevronUpIcon />
        </div>
        Preview
      </Button>
      <RunButton />
    </div>
  </div>

  {#if showMobilePreview}
    <Preview />
  {/if}
{/if}
