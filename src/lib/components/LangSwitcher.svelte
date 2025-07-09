<script lang='ts'>
  import type { LangUnion } from '$lib/types'
  import { browser } from '$app/environment'
  import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js'
  import { µ } from '$lib/global.svelte'
  import { haptic } from 'ios-haptics'

  const props: { class?: string } = $props()

  const hash = browser ? location.hash.replace('#', '') : ''

  const validHash: LangUnion = hash === 'html' || hash === 'css' || hash === 'js' ? hash : 'html'

  let value: LangUnion = $state(validHash)

  $effect(() => {
    location.hash = `#${value}`
    µ.currentTab = value
  })
</script>

<ToggleGroup.Root
  variant='outline'
  type='single'
  bind:value
  class={props.class}
>
  {@render langTab('html')}
  {@render langTab('css')}
  {@render langTab('js')}
</ToggleGroup.Root>

{#snippet langTab(lang: LangUnion)}
  <ToggleGroup.Item
    onclick={(e) => {
      if (µ.currentTab !== lang) {
        haptic()
      }
      else {
        e.preventDefault()
      }
    }}
    value={lang}
    class='px-6'
  >
    {lang}
  </ToggleGroup.Item>
{/snippet}
