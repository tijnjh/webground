<script lang="ts">
  import { decode } from "$lib/codec";
  import LangSwitcher from "$lib/components/LangSwitcher.svelte";
  import Preview, { updatePreview } from "$lib/components/Preview.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { µ } from "$lib/global.svelte";
  import type { Code } from "$lib/types";
  import { extractCodeParams, localStore, setTabFromHash } from "$lib/utils";
  import { ChevronUpIcon } from "@lucide/svelte";
  import { haptic } from "ios-haptics";
  import { Effect } from "effect";
  import { onMount } from "svelte";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import RunButton from "$lib/components/RunButton.svelte";
  import Console from "$lib/components/Console.svelte";
  import { codeState } from "$lib/code-state.svelte";
  import { useIsMobile, useIsShared } from "$lib/hooks.svelte";
  import Editor from "$lib/components/Editor.svelte";
  import { toast } from "svelte-sonner";

  const isMobile = useIsMobile();
  const isShared = useIsShared();

  let showMobilePreview = $state(false);

  onMount(async () => {
    if (isShared) {
      const { h, c, j } = extractCodeParams();

      // let html = "";
      // let css = "";
      // let js = "";

      // [html, css, js] = Effect.runSync(
      //   Effect.catchAll(
      //     Effect.all([
      //       h ? decode(h) : Effect.succeed(""),
      //       c ? decode(c) : Effect.succeed(""),
      //       j ? decode(j) : Effect.succeed(""),
      //     ]),
      //     (error) => {
      //       toast.error(error.message);
      //       console.error(error);
      //       return Effect.succeed(["", "", ""]);
      //     },
      //   ),
      // );

      const decoded = await Effect.runPromiseExit(
        Effect.all([
          h ? decode(h) : Effect.succeed(""),
          c ? decode(c) : Effect.succeed(""),
          j ? decode(j) : Effect.succeed(""),
        ])
      );

      if (decoded._tag === "Failure") {
        toast.error(decoded._op);
        console.error(decoded.cause);
        return;
      }

      decoded;

      const { html, css, js } = decoded.value;

      codeState.current = { html, css, js };
    } else {
      const code = Effect.runSync(localStore("code"));

      if (code) {
        for (const [key, val] of Object.entries(code)) {
          codeState.current[key as keyof Code] = val as string;
        }
      }
    }

    setTabFromHash(µ.currentTab, codeState.current);
  });
</script>

<svelte:window
  onhashchange={() => void setTabFromHash(µ.currentTab, codeState.current)}
  onkeydown={async (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      await Effect.runPromise(updatePreview(codeState.current));
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
      <div class="flex flex-col h-full">
        <Preview class="size-full grow" />
        <Console />
      </div>
    </Resizable.Pane>
  </Resizable.PaneGroup>
{:else}
  <!-- mobile layout -->
  <div class="grid grid-rows-[1fr_min-content] h-dvh">
    <Editor />

    <LangSwitcher class="bottom-20 left-4 fixed bg-white dark:bg-[#1e1e1e]" />

    <div
      class="flex justify-between items-center bg-white dark:bg-[#1e1e1e] p-4 border-t"
    >
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
