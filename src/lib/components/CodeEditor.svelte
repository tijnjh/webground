<script lang="ts">
  import loader from "@monaco-editor/loader";
  import { emmetHTML } from "emmet-monaco-es";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  import { onDestroy, onMount } from "svelte";

  let editor: Monaco.editor.IStandaloneCodeEditor;
  let monaco: typeof Monaco;
  let editorContainer: HTMLElement;

  // Define props with Svelte 5 syntax
  interface Props {
    value: string;
    language?: string;
    theme?: string;
  }

  let {
    value = $bindable(),
    language = "html",
    theme = "vs-dark",
  }: Props = $props();

  onMount(() => {
    (async () => {
      // Remove the next two lines to load the monaco editor from a CDN
      // see https://www.npmjs.com/package/@monaco-editor/loader#config
      const monacoEditor = await import("monaco-editor");
      loader.config({ monaco: monacoEditor.default });

      monaco = await loader.init();

      emmetHTML(monaco);

      // Your monaco instance is ready, let's display some code!
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
      });

      editor.onDidChangeModelContent((e) => {
        if (e.isFlush) {
          // true if setValue call
          //console.log('setValue call');
          /* editor.setValue(value); */
        } else {
          // console.log('user input');
          const updatedValue = editor?.getValue() ?? " ";
          value = updatedValue;
        }
      });
    })();
  });

  $effect(() => {
    if (value) {
      if (editor) {
        // check if the editor is focused
        if (editor.hasWidgetFocus()) {
          // let the user edit with no interference
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

<div class="container" bind:this={editorContainer}></div>

<style>
  .container {
    position: absolute;
    inset: 0;
  }
</style>
