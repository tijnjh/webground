<script lang="ts">
  import { Toaster } from "svelte-sonner";
  import CodeEditor from "./lib/components/CodeEditor.svelte";
  import Dialog from "./lib/components/Dialog.svelte";
  import { PaneGroup, Pane, PaneResizer } from "paneforge";
  import { clearCode, template } from "./lib/helpers";
  import { checkParams, share } from "./lib/sharing";
  import {
    EllipsisIcon,
    GithubIcon,
    LinkIcon,
    PencilIcon,
    PlayIcon,
    ShareIcon,
    Trash2Icon,
  } from "@lucide/svelte";
  import { onMount } from "svelte";

  import type { Code } from "./lib/types";

  let isMenuOpen = $state(false);
  let isClearMenuOpen = $state(false);
  let isShareMenuOpen = $state(false);
  let currentTab = $state("html");
  let showMobilePreview = $state(false);

  let previewSrc = $state("/start.html");

  let title = $state("");

  const code = $state({
    html: "",
    css: "",
    js: "",
  });

  function renderPreview() {
    if (Object.values(code).every((value) => value.trim() === "")) {
      previewSrc = "/start.html";
      return;
    }
    const url = URL.createObjectURL(
      new Blob([template(code)], { type: "text/html" })
    );

    previewSrc = url;

    localStorage.code = JSON.stringify(code);
  }

  function setTabFromHash() {
    const hash = window.location.hash.replace("#", "");
    if (["html", "css", "js"].includes(hash)) {
      currentTab = hash;
    }
  }

  onMount(() => {
    setTabFromHash();
    window.addEventListener("hashchange", setTabFromHash);
    return () => window.removeEventListener("hashchange", setTabFromHash);
  });

  const isShared = checkParams(window.location.href, code);

  if (!isShared) {
    if (localStorage.code) {
      for (const [key, val] of Object.entries(JSON.parse(localStorage.code)))
        code[key as keyof Code] = val as string;
    }
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "Enter")) {
      e.preventDefault();
      renderPreview();
    }
  }}
/>

{#if window.matchMedia("(min-width: 768px)").matches}
  <!-- desktop layout -->
  <PaneGroup direction="horizontal">
    <Pane defaultSize={50} class="h-svh">
      {@render editor()}
    </Pane>

    <PaneResizer class="grid bg-zinc-800 place-items-center w-4">
      <span class="h-12 rounded-full w-1 bg-zinc-600"></span>
    </PaneResizer>

    <Pane defaultSize={50}>
      {@render preview()}
    </Pane>
  </PaneGroup>
{:else}
  <!-- mobile layout -->
  <div class="h-svh grid grid-rows-[1fr_3rem]">
    {@render editor({ mobile: true })}

    <div
      class="flex justify-between items-center pr-2 bg-[#1e1e1e] border-t border-zinc-700"
    >
      {@render langSwitcher({ mobile: true })}
      <button
        onclick={() => (showMobilePreview = !showMobilePreview)}
        class="btn bg-white text-black"
      >
        Preview
      </button>
    </div>
  </div>

  {#if showMobilePreview}
    {@render preview({ mobile: true })}
  {/if}
{/if}

<Toaster richColors />

{#snippet editor({ mobile } = { mobile: false })}
  <div
    id="outer-editor"
    class="width-screen h-full relative grid grid-rows-[min-content_1fr] overflow-hidden bg-[#1e1e1e]"
  >
    <div class="flex items-center justify-between gap-2 p-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div>
            <button
              class="p-0 text-white bg-amber-600 btn"
              aria-label="Toggle menu"
              onclick={() => (isMenuOpen = !isMenuOpen)}
              disabled={isMenuOpen}
            >
              <EllipsisIcon size={16} />
              <span class="sr-only">Menu</span>
            </button>

            <Dialog bind:open={isMenuOpen}>
              <ul class="grid grid-cols-1 gap-2">
                <h1>WebGround</h1>
                <li>
                  <span class="block">
                    <a
                      href="https://github.com/tijnjh/webground"
                      class="w-full text-blue-500 bg-blue-100 btn"
                    >
                      <GithubIcon size={16} />
                      View source
                    </a>
                  </span>
                </li>
              </ul>
              {#if !isShared}
                <div class="w-full h-px my-4 bg-black/10"></div>
                <ul>
                  <li class="w-full">
                    <div class="w-full">
                      <button
                        id="open-clear-btn"
                        class="w-full text-red-500 bg-red-100 btn"
                        onclick={() => (isClearMenuOpen = !isClearMenuOpen)}
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
                          id="clear-btn"
                          onclick={() => {
                            isMenuOpen = false;
                            isClearMenuOpen = false;
                            clearCode(code);
                          }}
                          class="w-full text-red-500 bg-red-100 btn"
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
              class="btn bg-sky-800 text-white"
              onclick={() => (isShareMenuOpen = !isShareMenuOpen)}
              disabled={isShareMenuOpen}
            >
              <ShareIcon size={16} />
              Share
            </button>
            <Dialog bind:open={isShareMenuOpen}>
              <ul class="grid items-center w-full grid-cols-1">
                <li class="flex justify-between">
                  <p>Link sharing options</p>
                </li>

                <div class="w-full h-px my-4 bg-black/10"></div>

                <li>
                  <div class="grid gap-2">
                    {@render shareButton("full", "Full URL")}
                  </div>
                </li>

                <div class="w-full h-px my-4 bg-black/10"></div>

                <label class="flex items-center gap-4 mb-4">
                  <span>Title</span>
                  <input
                    type="text"
                    placeholder="Shared code"
                    class="grow text-right outline-none"
                    bind:value={title}
                  />
                </label>

                <li>
                  <div class="grid gap-2">
                    {@render shareButton("markdown", "Markdown")}
                    {@render shareButton("html", "HTML")}
                  </div>
                </li>
              </ul>
            </Dialog>
          </div>
        </div>
      </div>

      {#if !mobile}
        {@render langSwitcher()}
      {/if}

      <div class="flex items-center gap-2">
        {#if isShared}
          <button
            onclick={() => {
              localStorage.code = JSON.stringify(code);
              location.href = location.href.split("?")[0];
            }}
            id="edit-code-btn"
            class="text-blue-500 bg-blue-100 btn"
          >
            <PencilIcon size={16} />
            Edit
          </button>
        {/if}

        <button
          class="run-btn hidden text-white bg-green-600 md:flex btn"
          onclick={renderPreview}
        >
          <PlayIcon size={16} />
          Run
        </button>
      </div>
    </div>

    <div
      class="isolate relative *:absolute *:inset-0 *:h-full *:transition-[filter] *:duration-500"
    >
      <div style="z-index: {currentTab === 'html' ? '100' : '0'}">
        <CodeEditor
          bind:value={code.html}
          language="html"
          readOnly={isShared}
        />
      </div>

      <div style="z-index: {currentTab === 'css' ? '100' : '0'}">
        <CodeEditor bind:value={code.css} language="css" readOnly={isShared} />
      </div>

      <div style="z-index: {currentTab === 'js' ? '100' : '0'}">
        <CodeEditor
          bind:value={code.js}
          language="javascript"
          readOnly={isShared}
        />
      </div>
    </div>
  </div>
{/snippet}

{#snippet preview({ mobile } = { mobile: false })}
  <div
    id="outer-preview"
    class={mobile ? "top-[68px] fixed inset-x-0 bottom-12 z-50" : "h-full"}
  >
    <iframe
      title="preview"
      class="size-full bg-white border-0"
      id="preview"
      referrerpolicy="no-referrer"
      sandbox="allow-modals allow-downloads allow-scripts allow-forms"
      src={previewSrc}
    >
    </iframe>
  </div>
{/snippet}

{#snippet shareButton(mode: "full" | "markdown" | "html", label: string)}
  <button
    onclick={() => {
      isShareMenuOpen = false;
      share({
        mode: mode,
        title: title || "Shared code",
        code: code,
      });
    }}
    class="share-btn w-full bg-gray-100 btn"
  >
    <LinkIcon size={16} />
    {label}
  </button>
{/snippet}

{#snippet langButton(lang: string, color: string)}
  <button
    onclick={() => {
      currentTab = lang;
      window.location.hash = "#" + lang;
    }}
    class="font-medium uppercase w-24 text-sm justify-center rounded-lg py-1.5 cursor-pointer flex items-center gap-2"
    data-lang={lang}
  >
    <span class="size-2.5 rounded-full" style="background-color: {color}">
    </span>
    {lang}
  </button>
{/snippet}

{#snippet langSwitcher({ mobile } = { mobile: false })}
  <div
    class="flex relative border-zinc-700 p-1 rounded-xl isolate overflow-clip
     {!mobile && 'border'}"
  >
    <span
      class="w-24 absolute top-1 left-1 bg-zinc-700 rounded-lg -z-10 bottom-1 transition-[left]"
      style="left: {currentTab === 'html'
        ? '.25rem'
        : currentTab === 'css'
          ? '6.25rem'
          : currentTab === 'js'
            ? '12.25rem'
            : 0}"
    ></span>
    {@render langButton("html", "#ff5733")}
    {@render langButton("css", "rebeccapurple")}
    {@render langButton("js", "#f7df1e")}
  </div>
{/snippet}
