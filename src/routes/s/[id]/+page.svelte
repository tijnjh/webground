<script lang="ts">
  import { codeState } from "$lib/code-state.svelte";
  import Console from "$lib/components/Console.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import LangSwitcher from "$lib/components/LangSwitcher.svelte";
  import Preview, { updatePreview } from "$lib/components/Preview.svelte";
  import RunButton from "$lib/components/RunButton.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import { µ } from "$lib/global.svelte";
  import { isMobile, setTabFromHash } from "$lib/utils";
  import { ChevronUpIcon } from "@lucide/svelte";
  import { haptic } from "ios-haptics";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let showMobilePreview = $state(false);

  onMount(() => {
    codeState.current = {
      html: data.project.htmlCode,
      css: data.project.cssCode,
      js: data.project.jsCode,
    };

    setTabFromHash(µ.currentTab, codeState.current);
    updatePreview(codeState.current);
  });
</script>

<svelte:head>
  <title>{data.project.title} - Webground</title>
  <meta
    name="description"
    content={data.project.description || "A web development playground"}
  />
</svelte:head>

<svelte:window
  onhashchange={() => void setTabFromHash(µ.currentTab, codeState.current)}
  onkeydown={(e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      updatePreview(codeState.current);
    }
  }}
/>

<div class="bg-blue-100 dark:bg-blue-900 p-2 text-sm text-center">
  <strong>{data.project.title}</strong>
  {#if data.project.description}
    - {data.project.description}
  {/if}
  {#if data.creator}
    <span class="ml-2">
      • Made by
      <a
        href="/@{data.creator.username}"
        class="font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        @{data.creator.username}
      </a>
    </span>
  {/if}
  <a href="/" class="ml-4 text-blue-600 dark:text-blue-400 hover:underline"
  >Create your own</a>
</div>

{#if !isMobile}
  <!-- desktop layout -->
  <Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane defaultSize={50} class="h-[calc(100vh-3rem)]">
      <Editor readonly={true} />
    </Resizable.Pane>

    <Resizable.Handle />

    <Resizable.Pane defaultSize={50}>
      <div class="flex flex-col h-full">
        <Preview class="size-full grow" />
        <Console />
      </div>
    </Resizable.Pane>
  </Resizable.PaneGroup>
{:else}
  <!-- mobile layout -->
  <div class="grid grid-rows-[1fr_min-content] h-[calc(100vh-3rem)]">
    <Editor readonly={true} />

    <LangSwitcher class="bottom-20 left-4 fixed bg-white dark:bg-[#1e1e1e]" />

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
    <div class="top-17 bottom-17 isolate fixed flex flex-col w-full">
      <Preview class="grow" />
      <Console />
    </div>
  {/if}
{/if}
