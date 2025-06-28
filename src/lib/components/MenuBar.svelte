<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import { codeState } from "$lib/code-state.svelte";
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
  import AppearanceToggle from "./AppearanceToggle.svelte";
  import LangSwitcher from "./LangSwitcher.svelte";
  import RunButton from "./RunButton.svelte";

  let isMenuOpen = $state(false);
  let isClearMenuOpen = $state(false);
  let isShareMenuOpen = $state(false);
  let title = $state("");

  const isShared = checkIfShared().unwrapOr(false);

  async function shareProject() {
    const user = page.data.user;
    if (!user) {
      toast.error("Please log in to save projects");
      return;
    }

    const title = prompt("Enter a title for your project:");
    if (!title) return;

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: "",
          htmlCode: codeState.current.html,
          cssCode: codeState.current.css,
          jsCode: codeState.current.js,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save project");
      }

      const data = await response.json();
      const shortUrl = `${window.location.origin}${data.url}`;

      await navigator.clipboard.writeText(shortUrl);
      toast.success(
        `Project saved! Short URL copied to clipboard: ${shortUrl}`,
      );
    } catch (error) {
      toast.error("Failed to save project");
    }
  }
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

            <Separator class="my-2" />

            {#if page.data.user}
              <Button variant="outline" href="/@{page.data.user.username}">
                Profile (@{page.data.user.username})
              </Button>
              <form method="POST" action="/logout" use:enhance>
                <Button variant="outline" type="submit" class="w-full"
                >Logout</Button>
              </form>
            {:else}
              <a
                href="/login"
                class="block hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded w-full text-sm text-center"
              >
                Login
              </a>
              <a
                href="/signup"
                class="block hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded w-full text-sm text-center"
              >
                Sign Up
              </a>
            {/if}

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
                  Are you sure you want to your clear your code?

                  <Separator class="my-4" />

                  <Button
                    class="w-full"
                    variant="destructive"
                    onclick={() => {
                      haptic();
                      isMenuOpen = false;
                      isClearMenuOpen = false;
                      codeState.clear();
                      toast.success("Cleared code");
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

            <Separator class="my-2" />

            <button
              onclick={shareProject}
              class="bg-blue-600 hover:bg-blue-700 px-3 py-2 border border-blue-600 rounded w-full text-white text-sm text-center"
            >
              Save & Get Short URL
            </button>
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
  <button
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
    class="flex justify-center items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded w-full text-sm text-center"
  >
    <LinkIcon size={16} /> {label}
  </button>
{/snippet}
