<script lang="ts" module>
  let editor: Monaco.editor.IStandaloneCodeEditor;
  let monaco: typeof Monaco;

  type MonacoTheme = "vs-light" | "vs-dark";

  export function setTheme(theme: MonacoTheme) {
    if (monaco && editor) {
      monaco.editor.setTheme(theme);
    }
  }
</script>

<script lang="ts">
  import loader from "@monaco-editor/loader";
  import { emmetHTML } from "emmet-monaco-es";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  import { onDestroy, onMount } from "svelte";
  import Spinner from "./Spinner.svelte";
  import { mode } from "mode-watcher";
  import type { LangUnion } from "$lib/types";
  import { codeState } from "$lib/code-state.svelte";

  let editorContainer: HTMLElement;

  interface Props {
    language: string;
    lang: LangUnion;
    readOnly?: boolean;
  }

  let { language, lang, readOnly = false }: Props = $props();

  let isLoading = $state(false);

  onMount(() => {
    (async () => {
      isLoading = true;
      monaco = await loader.init();
      isLoading = false;

      emmetHTML(monaco);

      editor = monaco.editor.create(editorContainer, {
        value: codeState.current[lang],
        language,
        theme: `vs-${mode.current}`,
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
          console.log("updating:", lang);
          const updatedValue = editor?.getValue() ?? " ";
          codeState.current[lang] = updatedValue;
        }
      });
    })();
  });

  // $effect(() => {
  //   if (value) {
  //     if (editor) {
  //       if (editor.hasWidgetFocus()) {
  //       } else {
  //         if (editor?.getValue() ?? " " !== value) {
  //           // editor?.setValue(value);
  //         }
  //       }
  //     }
  //   }
  //   if (value === "") {
  //     editor?.setValue(" ");
  //   }
  // });

  // onDestroy(() => {
  //   monaco?.editor.getModels().forEach((model) => model.dispose());
  //   editor?.dispose();
  // });
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
