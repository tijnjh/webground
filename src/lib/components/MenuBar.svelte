<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { checkIfShared, isMobile } from "$lib/utils";
  import {
    EllipsisIcon,
    GithubIcon,
    LinkIcon,
    PencilIcon,
    ShareIcon,
    Trash2Icon,
  } from "@lucide/svelte";
  import { haptic } from "ios-haptics";
  import { toast } from "svelte-sonner";
  import { copyLink } from "../sharing";
  import LangSwitcher from "./LangSwitcher.svelte";
  import AppearanceToggle from "./AppearanceToggle.svelte";
  import RunButton from "./RunButton.svelte";
  import { codeState } from "$lib/code-state.svelte";

  let isMenuOpen = $state(false);
  let isClearMenuOpen = $state(false);
  let isShareMenuOpen = $state(false);
  let title = $state("");

  const isShared = checkIfShared().unwrapOr(false);
</script>

<div class="flex justify-between items-center gap-2 p-4">
  <div class="flex items-center gap-3">
    <div class="flex items-center gap-2">
      <Popover.Root bind:open={isMenuOpen}>
        <Popover.Trigger>
          <Button
            size="icon"
            variant="outline"
            aria-label="Toggle menu"
            onclick={haptic}
            disabled={isMenuOpen}
          >
            <EllipsisIcon size={16} />
            <span class="sr-only">Menu</span>
          </Button>
        </Popover.Trigger>

        <Popover.Content align="start">
          <div class="flex flex-col gap-2">
            <h1>WebGround</h1>

            <Button class="w-full" href="https://github.com/tijnjh/webground">
              <GithubIcon size={16} />
              View source
            </Button>

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
                <Popover.Content align="start">
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
                      codeState.clear();
                    }}
                  >
                    Confirm
                  </Button>
                </Popover.Content>
              </Popover.Root>
            {/if}

            <Separator class="my-2" />

            <AppearanceToggle />
          </div>
        </Popover.Content>
      </Popover.Root>

      <Popover.Root bind:open={isShareMenuOpen}>
        <Popover.Trigger>
          <Button variant="outline" onclick={haptic} disabled={isShareMenuOpen}>
            <ShareIcon size={16} />
            Share
          </Button>
        </Popover.Trigger>
        <Popover.Content align="start">
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
    <LangSwitcher />
  {/if}

  <div class="flex items-center gap-2">
    {#if isShared}
      <Button
        onclick={() => {
          localStorage.code = JSON.stringify(codeState.current);
          location.href = location.href.split("?")[0];
        }}
      >
        <PencilIcon size={16} />
        Edit
      </Button>
    {/if}

    {#if !isMobile}
      <RunButton />
    {/if}
  </div>
</div>

{#snippet shareButton(mode: "full" | "markdown" | "html", label: string)}
  <Button
    onclick={() => {
      isShareMenuOpen = false;

      const res = copyLink(codeState.current, mode, title);

      if (res.isErr()) {
        haptic.error();
        toast.error(res.error.message);
        return;
      }

      haptic.confirm();
      toast.success(`Copied link (${mode}) to clipboard`);

      if (res.value.isLong) {
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
