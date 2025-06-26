<script lang="ts">
  import { haptic } from "ios-haptics";
  import {
    EllipsisIcon,
    GithubIcon,
    LinkIcon,
    PencilIcon,
    ShareIcon,
    TerminalIcon,
    Trash2Icon,
  } from "@lucide/svelte";
  import { checkIfShared, clearCode, isMobile } from "../helpers";
  import type { Code, LangUnion } from "../types";
  import Monaco from "./Monaco.svelte";
  import { updatePreview } from "./Preview.svelte";
  import { copyLink } from "../sharing";
  import LangSwitcher from "./LangSwitcher.svelte";
  import { tryCatch } from "typecatch";
  import { toast } from "svelte-sonner";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";

  let {
    code = $bindable(),
    currentTab = $bindable(),
  }: {
    code: Code;
    currentTab: LangUnion;
  } = $props();

  let isMenuOpen = $state(false);
  let isClearMenuOpen = $state(false);
  let isShareMenuOpen = $state(false);
  let title = $state("");

  const isShared = checkIfShared();
</script>

<div class="relative grid grid-rows-[min-content_1fr] bg-[#1e1e1e] h-full overflow-hidden width-screen">
  <div class="flex justify-between items-center gap-2 p-4">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <Popover.Root bind:open={isMenuOpen}>
          <Popover.Trigger>
            <Button
              variant="outline"
              aria-label="Toggle menu"
              onclick={haptic}
              disabled={isMenuOpen}
            >
              <EllipsisIcon size={16} />
              <span class="sr-only">Menu</span>
            </Button>
          </Popover.Trigger>

          <Popover.Content>
            <div class="flex flex-col gap-2">
              <div>
                <h1 class="mb-4">WebGround</h1>
                <Button
                  class="w-full"
                  href="https://github.com/tijnjh/webground"
                >
                  <GithubIcon size={16} />
                  View source
                </Button>
              </div>

              {#if !isShared}
                <Separator class="my-2" />
                <Popover.Root bind:open={isClearMenuOpen}>
                  <Popover.Trigger>
                    <Button
                      class="w-full"
                      variant="destructive"
                      onclick={haptic}
                      disabled={isClearMenuOpen}
                    >
                      <Trash2Icon size={16} />
                      Clear all code
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content>
                    <p class="mb-2">
                      Are you sure you want to your clear your code?
                    </p>
                    <Button
                      class="w-full"
                      variant="destructive"
                      onclick={() => {
                        haptic();
                        isMenuOpen = false;
                        isClearMenuOpen = false;
                        clearCode(code);
                      }}
                    >
                      Confirm
                    </Button>
                  </Popover.Content>
                </Popover.Root>
              {/if}
            </div>
          </Popover.Content>
        </Popover.Root>

        <Popover.Root bind:open={isShareMenuOpen}>
          <Popover.Trigger>
            <Button
              variant="outline"
              onclick={haptic}
              disabled={isShareMenuOpen}
            >
              <ShareIcon size={16} />
              Share
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <div class="flex flex-col gap-2">
              <h3>Link sharing options</h3>

              <Separator class="my-2" />

              {@render shareButton("full", "Full URL")}

              <Separator class="my-2" />

              <label class="flex justify-between items-center gap-4 mb-2">
                <span>Title</span>
                <input
                  type="text"
                  placeholder="Shared code"
                  class="outline-none min-w-0 text-right"
                  bind:value={title}
                />
              </label>

              {@render shareButton("markdown", "Markdown")}
              {@render shareButton("html", "HTML")}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>

    {#if !isMobile}
      <LangSwitcher bind:currentTab />
    {/if}

    <div class="flex items-center gap-2">
      {#if isShared}
        <Button
          onclick={() => {
            localStorage.code = JSON.stringify(code);
            location.href = location.href.split("?")[0];
          }}
        >
          <PencilIcon size={16} />
          Edit
        </Button>
      {/if}

      <Button
        onclick={() => {
          haptic();
          const didUpdate = updatePreview(code);
          if (didUpdate) {
            haptic.confirm();
          }
        }}
      >
        <TerminalIcon size={16} />
        Run
      </Button>
    </div>
  </div>

  <div class="isolate *:absolute relative *:inset-0 *:h-full *:transition-[filter] *:duration-500">
    <div style={`z-index: ${currentTab === "html" ? "100" : "0"}`}>
      <Monaco bind:value={code.html} language="html" readOnly={isShared} />
    </div>

    <div style={`z-index: ${currentTab === "css" ? "100" : "0"}`}>
      <Monaco bind:value={code.css} language="css" readOnly={isShared} />
    </div>

    <div style={`z-index: ${currentTab === "js" ? "100" : "0"}`}>
      <Monaco bind:value={code.js} language="javascript" readOnly={isShared} />
    </div>
  </div>
</div>

{#snippet shareButton(mode: "full" | "markdown" | "html", label: string)}
  <Button
    onclick={() => {
      isShareMenuOpen = false;
      const { data, error } = tryCatch(() => copyLink(code, mode, title));

      if (error) {
        haptic.error();
        toast.error(error.message);
        return;
      }

      haptic.confirm();
      toast.success(`Copied link (${mode}) to clipboard`);

      if (data?.isLong) {
        setTimeout(() => {
          toast.warning(
            "URL is longer than 2048 characters, which might cause issues in certain browsers",
          );
        }, 300);
      }
    }}
    class="w-full"
  >
    <LinkIcon size={16} /> {label}
  </Button>
{/snippet}
