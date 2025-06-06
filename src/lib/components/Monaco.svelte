<!-- mostly from https://github.com/ala-garbaa-pro/svelte-5-monaco-editor-two-way-binding -->
<script lang="ts">
  import loader from "@monaco-editor/loader";
  import { emmetHTML } from "emmet-monaco-es";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  import { onDestroy, onMount } from "svelte";
  import Spinner from "./Spinner.svelte";

  let editor: Monaco.editor.IStandaloneCodeEditor;
  let monaco: typeof Monaco;
  let editorContainer: HTMLElement;

  interface Props {
    value: string;
    language?: string;
    theme?: string;
    readOnly?: boolean;
  }

  let {
    value = $bindable(),
    language = "html",
    theme = "vs-dark",
    readOnly = false,
  }: Props = $props();

  let isLoading = $state(false);

  onMount(() => {
    (async () => {
      isLoading = true;
      monaco = await loader.init();
      isLoading = false;

      emmetHTML(monaco);

      editor = monaco.editor.create(editorContainer, {
        value,
        language,
        theme,
        overviewRulerLanes: 0,
        overviewRulerBorder: false,
        automaticLayout: true,
        cursorBlinking: "smooth",
        smoothScrolling: true,
        fontSize: 13,
        minimap: { enabled: false },
        tabSize: 2,
        readOnly,
      });

      editor.onDidChangeModelContent((e) => {
        if (!e.isFlush) {
          const updatedValue = editor?.getValue() ?? " ";
          value = updatedValue;
        }
      });
    })();
  });

  $effect(() => {
    if (value) {
      if (editor) {
        if (editor.hasWidgetFocus()) {
        } else {
          if (editor?.getValue() ?? " " !== value) {
            editor?.setValue(value);
          }
        }
      }
    }
    if (value === "") {
      editor?.setValue(" ");
    }
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class="container" bind:this={editorContainer}>
  {#if isLoading}
    <div class="place-items-center grid size-full">
      <Spinner />
    </div>
  {/if}
</div>

<style>
  .container {
    position: absolute;
    inset: 0;
  }
</style>
