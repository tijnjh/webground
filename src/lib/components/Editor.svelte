<script lang="ts">
  import { haptic } from "ios-haptics";
  import {
    EllipsisIcon,
    GithubIcon,
    LinkIcon,
    PencilIcon,
    PlayIcon,
    ShareIcon,
    Trash2Icon,
  } from "@lucide/svelte";
  import Dialog from "./Dialog.svelte";
  import { checkIfShared, clearCode, isMobile } from "../helpers";
  import type { Code, LangUnion } from "../types";
  import Monaco from "./Monaco.svelte";
  import { updatePreview } from "./Preview.svelte";
  import { copyLink } from "../sharing";
  import LangSwitcher from "./LangSwitcher.svelte";
  import { tryCatch } from "typecatch";
  import { toast } from "svelte-sonner";

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

<div
  id="outer-editor"
  class="relative grid grid-rows-[min-content_1fr] bg-[#1e1e1e] h-full overflow-hidden width-screen"
>
  <div class="flex justify-between items-center gap-2 p-4">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div>
          <button
            class="bg-amber-600 p-0 text-white btn"
            aria-label="Toggle menu"
            onclick={() => {
              haptic();
              isMenuOpen = !isMenuOpen;
            }}
            disabled={isMenuOpen}
          >
            <EllipsisIcon size={16} />
            <span class="sr-only">Menu</span>
          </button>

          <Dialog bind:open={isMenuOpen}>
            <ul class="gap-2 grid grid-cols-1">
              <h1>WebGround</h1>
              <li>
                <span class="block">
                  <a
                    href="https://github.com/tijnjh/webground"
                    class="bg-blue-100 w-full text-blue-500 btn"
                    onclick={haptic}
                  >
                    <GithubIcon size={16} />
                    View source
                  </a>
                </span>
              </li>
            </ul>
            {#if !isShared}
              <div class="bg-black/10 my-4 w-full h-px"></div>
              <ul>
                <li class="w-full">
                  <div class="w-full">
                    <button
                      class="bg-red-100 w-full text-red-500 btn"
                      onclick={() => {
                        haptic();
                        isClearMenuOpen = !isClearMenuOpen;
                      }}
                      disabled={isClearMenuOpen}
                    >
                      <Trash2Icon size={16} />
                      Clear all code
                    </button>

                    <Dialog bind:open={isClearMenuOpen}>
                      <p class="mb-2">
                        Are you sure you want to your clear your code?
                      </p>
                      <button
                        onclick={() => {
                          haptic();
                          isMenuOpen = false;
                          isClearMenuOpen = false;
                          clearCode(code);
                        }}
                        class="bg-red-100 w-full text-red-500 btn"
                      >
                        Confirm
                      </button>
                    </Dialog>
                  </div>
                </li>
              </ul>
            {/if}
          </Dialog>
        </div>

        <div class="w-full">
          <button
            class="bg-sky-800 text-white btn"
            onclick={() => {
              haptic();
              isShareMenuOpen = !isShareMenuOpen;
            }}
            disabled={isShareMenuOpen}
          >
            <ShareIcon size={16} />
            Share
          </button>
          <Dialog bind:open={isShareMenuOpen}>
            <ul class="items-center grid grid-cols-1 w-full">
              <li class="flex justify-between">
                <p>Link sharing options</p>
              </li>

              <div class="bg-black/10 my-4 w-full h-px"></div>

              <li>
                <div class="gap-2 grid">
                  {@render shareButton("full", "Full URL")}
                </div>
              </li>

              <div class="bg-black/10 my-4 w-full h-px"></div>

              <label class="flex items-center gap-4 mb-4">
                <span>Title</span>
                <input
                  type="text"
                  placeholder="Shared code"
                  class="outline-none text-right grow"
                  bind:value={title}
                />
              </label>

              <li>
                <div class="gap-2 grid">
                  {@render shareButton("markdown", "Markdown")}
                  {@render shareButton("html", "HTML")}
                </div>
              </li>
            </ul>
          </Dialog>
        </div>
      </div>
    </div>

    {#if !isMobile}
      <LangSwitcher bind:currentTab />
    {/if}

    <div class="flex items-center gap-2">
      {#if isShared}
        <button
          onclick={() => {
            localStorage.code = JSON.stringify(code);
            location.href = location.href.split("?")[0];
          }}
          id="edit-code-btn"
          class="bg-blue-100 text-blue-500 btn"
        >
          <PencilIcon size={16} />
          Edit
        </button>
      {/if}

      <button
        class="hidden md:flex bg-green-600 text-white run-btn btn"
        onclick={() => {
          haptic();
          updatePreview(code);
        }}
      >
        <PlayIcon size={16} />
        Run
      </button>
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
  <button
    onclick={() => {
      isShareMenuOpen = false;
      const { error } = tryCatch(() => copyLink(code, mode, title));

      if (error) {
        haptic.error();
        toast.error(error.message);
        return;
      }

      haptic.confirm();
      toast.success(`Copied link (${mode}) to clipboard`);
    }}
    class="bg-gray-100 w-full share-btn btn"
  >
    <LinkIcon size={16} /> {label}
  </button>
{/snippet}
