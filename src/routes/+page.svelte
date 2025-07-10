<script lang='ts'>
  import type { Code } from '$lib/types'
  import { codeState } from '$lib/code-state.svelte'
  import { decode } from '$lib/codec'
  import Console from '$lib/components/Console.svelte'
  import Editor from '$lib/components/Editor.svelte'
  import LangSwitcher from '$lib/components/LangSwitcher.svelte'
  import Preview, { updatePreview } from '$lib/components/Preview.svelte'
  import RunButton from '$lib/components/RunButton.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import * as Resizable from '$lib/components/ui/resizable/index.js'
  import { µ } from '$lib/global.svelte'
  import { useIsMobile, useIsShared } from '$lib/hooks.svelte'
  import { extractCodeParams, localStore, setTabFromHash } from '$lib/utils'
  import { ChevronUpIcon } from '@lucide/svelte'
  import { Micro } from 'effect'
  import { haptic } from 'ios-haptics'
  import { onMount } from 'svelte'
  import { toast } from 'svelte-sonner'

  const isMobile = useIsMobile()
  const isShared = useIsShared()

  let showMobilePreview = $state(false)

  onMount(async () => {
    if (isShared) {
      const { h, c, j } = extractCodeParams()

      const decoded = await Micro.runPromiseExit(
        Micro.all([
          h ? decode(h) : Micro.succeed(''),
          c ? decode(c) : Micro.succeed(''),
          j ? decode(j) : Micro.succeed(''),
        ], { concurrency: 3 }),
      )

      if (decoded._tag === 'Failure') {
        toast.error(decoded.cause.message)
        console.error(decoded.cause)
        return
      }

      const [html, css, js] = decoded.value

      codeState.current = { html, css, js }
    }
    else {
      const codeResult = await Micro.runPromiseExit(Micro.succeed(localStore('code') || {}))

      if (codeResult._tag === 'Success') {
        const code = codeResult.value
        for (const [key, val] of Object.entries(code)) {
          codeState.current[key as keyof Code] = val as string
        }
      }
      else {
        console.error('Failed to retrieve code from localStorage:', codeResult.cause)
      }
    }

    setTabFromHash(µ.currentTab, codeState.current)
  })
</script>

<svelte:window
  onhashchange={() => void setTabFromHash(µ.currentTab, codeState.current)}
  onkeydown={async (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter')) {
      e.preventDefault()
      await Micro.runPromise(updatePreview)
    }
  }}
/>

{#if !isMobile}
  <!-- desktop layout -->
  <Resizable.PaneGroup direction='horizontal'>
    <Resizable.Pane defaultSize={50} class='h-dvh'>
      <Editor />
    </Resizable.Pane>

    <Resizable.Handle />

    <Resizable.Pane defaultSize={50}>
      <div class='flex flex-col h-full'>
        <Preview class='size-full grow' />
        <Console />
      </div>
    </Resizable.Pane>
  </Resizable.PaneGroup>
{:else}
  <!-- mobile layout -->
  <div class='grid grid-rows-[1fr_min-content] h-dvh'>
    <Editor />

    <LangSwitcher class='bottom-20 left-4 fixed bg-white dark:bg-[#1e1e1e]' />

    <div class='flex justify-between items-center bg-white dark:bg-[#1e1e1e] p-4 border-t'>
      <Button
        onclick={() => {
          haptic()
          showMobilePreview = !showMobilePreview
        }}
      >
        <div
          class='transition-transform'
          class:rotate-x-180={showMobilePreview}
        >
          <ChevronUpIcon />
        </div>
        Preview
      </Button>
      <RunButton />
    </div>
  </div>

  {#if showMobilePreview}
    <div class='top-17 bottom-17 isolate fixed flex flex-col w-full'>
      <Preview class='grow' />
      <Console />
    </div>
  {/if}
{/if}
