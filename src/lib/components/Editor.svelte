<script lang='ts'>
  import { µ } from '$lib/global.svelte'
  import { useIsShared } from '$lib/hooks.svelte'
  import MenuBar from './MenuBar.svelte'
  import Monaco from './Monaco.svelte'

  const isShared = useIsShared()
</script>

<div class='relative grid grid-rows-[min-content_1fr] dark:bg-[#1e1e1e] h-full overflow-hidden width-screen'>
  <MenuBar />

  <div class='isolate *:absolute relative *:inset-0 *:h-full *:transition-[filter] *:duration-500'>
    {#each [['html'], ['css'], ['js', 'javascript']] as [lang, language]}
      {#if µ.currentTab === lang}
        <div>
          <Monaco {lang} language={language ?? lang} readOnly={isShared} />
        </div>
      {/if}
    {/each}
  </div>
</div>
