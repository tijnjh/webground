<script lang="ts">
  import { Toaster } from "svelte-sonner";
  import CodeEditor from "./lib/components/CodeEditor.svelte";
  import Dialog from "./lib/components/Dialog.svelte";
  import { Pane, Splitpanes } from "svelte-splitpanes";
  import { clearCode, template } from "./lib/helpers";
  import { checkParams, share } from "./lib/sharing";
  import {
    MenuIcon,
    PencilIcon,
    PlayCircleIcon,
    ShareIcon,
    Trash2Icon,
  } from "@lucide/svelte";
  import { onMount } from "svelte";

  import type { Code } from "./lib/types";

  let openMenu = $state(false);
  let openClearMenu = $state(false);
  let openShareMenu = $state(false);
  let currentTab = $state("html");
  let showMobilePreview = $state(false);

  let previewSrc = $state("/start.html");

  const code = $state({
    html: "",
    css: "",
    js: "",
  });

  function renderPreview() {
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
    for (const [key, val] of Object.entries(JSON.parse(localStorage.code)))
      code[key as keyof Code] = val as string;
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

<Splitpanes>
  <Pane snapSize={10}>
    <div
      id="outer-editor"
      class="width-screen h-svh relative grid grid-rows-[min-content_min-content_1fr] overflow-hidden bg-[#1e1e1e]"
    >
      <div class="flex items-center justify-between gap-2 p-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div>
              <button
                class="p-0 text-white bg-amber-500 dark:bg-amber-900 btn"
                aria-label="Toggle menu"
                onclick={() => (openMenu = !openMenu)}
                disabled={openMenu}
              >
                <MenuIcon size={16} />
                Menu
              </button>

              <Dialog bind:open={openMenu}>
                {#if !isShared}
                  <ul>
                    <li class="w-full">
                      <div class="w-full">
                        <button
                          id="open-clear-btn"
                          class="w-full text-red-500 bg-red-100 btn dark:bg-red-500/10"
                          onclick={() => (openClearMenu = !openClearMenu)}
                          disabled={openClearMenu}
                        >
                          <Trash2Icon size={16} />
                          Clear all code
                        </button>

                        <Dialog bind:open={openClearMenu}>
                          <p class="mb-2">
                            Are you sure you want to your clear your code?
                          </p>
                          <button
                            id="clear-btn"
                            onclick={() => {
                              openMenu = false;
                              openClearMenu = false;
                              clearCode(code);
                            }}
                            class="w-full text-red-500 bg-red-100 btn dark:bg-red-500/10"
                          >
                            Confirm
                          </button>
                        </Dialog>
                      </div>
                    </li>
                  </ul>
                  <div
                    class="w-full h-px my-4 bg-black/10 dark:bg-white/10"
                  ></div>
                {/if}

                <ul class="grid grid-cols-1 gap-2">
                  <li>
                    <span class="block"
                      >Jnscode by
                      <a
                        class="text-amber-500 dark:text-ambre-900 hover:underline"
                        href="https://tijn.dev">Tijn</a
                      >
                      -
                      <a
                        href="https://github.com/tijnjh/jnscode"
                        class="text-amber-500 hover:underline"
                      >
                        View on GitHub
                      </a>
                    </span>
                  </li>
                </ul>
              </Dialog>
            </div>

            <div class="w-full">
              <button
                class="text-blue-500 bg-blue-100 btn dark:bg-blue-500/15"
                onclick={() => (openShareMenu = !openShareMenu)}
                disabled={openShareMenu}
              >
                <ShareIcon size={16} />
                Share
              </button>
              <Dialog bind:open={openShareMenu}>
                <ul class="grid items-center w-full grid-cols-1">
                  <li class="flex justify-between">
                    <p>Link options</p>
                    <p class="opacity-40">(Click to copy)</p>
                  </li>

                  <div
                    class="w-full h-px my-4 bg-black/10 dark:bg-white/10"
                  ></div>

                  <li class="mb-4">
                    <div class="grid gap-2">
                      <button
                        title="Will be long"
                        onclick={() => {
                          openShareMenu = false;
                          share({
                            mode: "full",
                            title: "placeholder",
                            code: code,
                          });
                        }}
                        class="share-btn w-full bg-gray-100 dark:text-white btn dark:bg-white/5"
                        data-share-as="full"
                      >
                        Full URL
                      </button>
                      <button
                        title="[document title](full url)"
                        onclick={() => (openShareMenu = false)}
                        class="share-btn w-full bg-gray-100 dark:text-white btn dark:bg-white/5"
                        data-share-as="markdown"
                      >
                        Markdown
                      </button>
                      <button
                        onclick={() => (openShareMenu = false)}
                        class="share-btn w-full bg-gray-100 dark:text-white btn dark:bg-white/5"
                        data-share-as="html"
                      >
                        HTML
                      </button>
                    </div>
                  </li>
                </ul>
              </Dialog>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          {#if isShared}
            <button
              onclick={() => {
                localStorage.code = JSON.stringify(code);
                location.href = location.href.split("?")[0];
              }}
              id="edit-code-btn"
              class="text-blue-500 bg-blue-100 btn dark:bg-blue-500/15"
            >
              <PencilIcon size={16} />
              Edit
            </button>
          {/if}

          <button
            class="run-btn hidden text-white bg-green-500 md:flex btn dark:bg-green-900"
            onclick={renderPreview}
          >
            <PlayCircleIcon size={16} />
            Run
          </button>
        </div>
      </div>
      <div
        id="tabs"
        class="*:border-zinc-700 *:font-mono *:hover:underline border-y border-zinc-700 *:border-r *:text-white flex *:w-24 *:rounded-none! bg-[#1e1e1e]"
      >
        {@render langButton("html")}
        {@render langButton("css")}
        {@render langButton("js")}
      </div>

      <div
        class="isolate relative *:absolute *:inset-0 *:h-full *:transition-[filter] *:duration-500"
        class:brightness-50={showMobilePreview}
      >
        <div style="z-index: {currentTab === 'html' ? '100' : '0'}">
          <CodeEditor bind:value={code.html} language="html" />
        </div>

        <div style="z-index: {currentTab === 'css' ? '100' : '0'}">
          <CodeEditor bind:value={code.css} language="css" />
        </div>

        <div style="z-index: {currentTab === 'js' ? '100' : '0'}">
          <CodeEditor bind:value={code.js} language="javascript" />
        </div>
      </div>
    </div>
  </Pane>
  <Pane snapSize={10}>
    <div
      id="outer-preview"
      style="transform: {window.innerWidth < 1024
        ? showMobilePreview
          ? 'translatey(0)'
          : 'translatey(100%)'
        : ''}"
      class="fixed top-0 flex-grow w-full overflow-hidden transition-transform duration-300 translate-y-full h-dvh md:relative md:top-0 md:h-dvh md:translate-y-0"
    >
      <iframe
        title="preview"
        class="w-full h-full bg-white border-0"
        id="preview"
        referrerpolicy="no-referrer"
        sandbox="allow-modals allow-downloads allow-scripts allow-forms"
        src={previewSrc}
      >
      </iframe>
    </div>
  </Pane>
  <div class="fixed flex gap-2 dark:text-gray-200 left-4 bottom-4">
    <button
      style="opacity: 1 !important"
      onclick={() => (showMobilePreview = !showMobilePreview)}
      class="z-50 text-white bg-black btn dark:bg-white dark:text-black md:hidden!"
      aria-label="Show mobile preview"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={`transform: rotateX(${showMobilePreview ? "180deg" : "0"})`}
        viewBox="0 0 16 16"
        fill="currentColor"
        class="transition-transform duration-300 size-6"
      >
        <path
          fill-rule="evenodd"
          d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <button
      onclick={renderPreview}
      style="opacity: 1 !important"
      class="run-btn z-50 text-white bg-green-500 btn dark:bg-green-900 md:hidden!"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="size-4"
      >
        <path
          d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z"
        />
      </svg>
      Run
    </button>
  </div>
</Splitpanes>
<Toaster />

{#snippet langButton(lang: string)}
  <button
    onclick={() => {
      currentTab = lang;
      window.location.hash = "#" + lang;
    }}
    class="btn {currentTab === lang && 'bg-zinc-700'}"
    class:bg-zinc-700={currentTab === lang}
    data-lang={lang}
  >
    {lang}
  </button>
{/snippet}
