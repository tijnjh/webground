<script lang='ts' module>
  import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'

  let editor: Monaco.editor.IStandaloneCodeEditor
  let monaco: typeof Monaco

  type MonacoTheme = 'vs-light' | 'vs-dark'

  export function setTheme(theme: MonacoTheme) {
    if (monaco && editor) {
      monaco.editor.setTheme(theme)
    }
  }
</script>

<script lang='ts'>
  import type { LangUnion } from '$lib/types'
  import { codeState } from '$lib/code-state.svelte'
  import loader from '@monaco-editor/loader'
  import { emmetHTML } from 'emmet-monaco-es'
  import { mode } from 'mode-watcher'
  import { onMount } from 'svelte'
  import Spinner from './Spinner.svelte'

  let editorContainer: HTMLElement

  interface Props {
    language: string
    lang: LangUnion
    readOnly?: boolean
  }

  const { language, lang, readOnly = false }: Props = $props()

  let isLoading = $state(false)

  onMount(() => {
    (async () => {
      isLoading = true
      monaco = await loader.init()
      isLoading = false

      emmetHTML(monaco)

      editor = monaco.editor.create(editorContainer, {
        value: codeState.current[lang],
        language,
        theme: `vs-${mode.current}`,
        overviewRulerLanes: 0,
        overviewRulerBorder: false,
        automaticLayout: true,
        cursorBlinking: 'smooth',
        smoothScrolling: true,
        fontSize: 13,
        minimap: { enabled: false },
        tabSize: 2,
        readOnly,
      })

      editor.onDidChangeModelContent((e) => {
        if (!e.isFlush) {
          const updatedValue = editor?.getValue() ?? ' '
          codeState.current[lang] = updatedValue
        }
      })
    })()
  })
</script>

<div class='container' bind:this={editorContainer}>
  {#if isLoading}
    <div class='place-items-center grid size-full'>
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
