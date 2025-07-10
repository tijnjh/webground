<script lang='ts'>
  import type { ConsoleAction } from '$lib/types'
  import { cn } from '$lib/utils'
  import {
    ChevronUp,
    CircleXIcon,
    Trash2Icon,
    TriangleAlertIcon,
  } from '@lucide/svelte'
  import { haptic } from 'ios-haptics'
  import { toast } from 'svelte-sonner'
  import Button from './ui/button/button.svelte'

  let messages: ConsoleAction[] = $state([])
  let isCollapsed = $state(true)

  const messageCounts = $derived({
    log: messages.filter(m => m.type === 'log').length,
    warn: messages.filter(m => m.type === 'warn').length,
    error: messages.filter(m => m.type === 'error').length,
  })

  function toggle() {
    isCollapsed = !isCollapsed
    haptic()
  }
</script>

<svelte:window
  onmessage={(e: MessageEvent) => {
    const data = e.data as ConsoleAction

    if (e.data.__webground) {
      messages.unshift(data)
    }
  }}
  onkeydown={(e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault()
      toggle()
    }
  }}
/>

<div class='bg-zinc-100 dark:bg-zinc-900 border-t'>
  <div class='flex justify-between items-center gap-4 bg-white dark:bg-zinc-800 px-4 py-2'>
    <div class='flex items-center gap-2'>
      <h3 class='font-medium'>Console</h3>
      <div class='flex items-center gap-2 text-xs'>
        {#if messageCounts.log > 0}
          <span
            class='bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 border rounded-full'
          >
            {messageCounts.log}
          </span>
        {/if}
        {#if messageCounts.warn > 0}
          <span
            class='bg-yellow-500/10 px-2 py-0.5 border rounded-full text-yellow-500'
          >
            {messageCounts.warn}
          </span>
        {/if}
        {#if messageCounts.error > 0}
          <span
            class='bg-red-500/10 px-2 py-0.5 border rounded-full text-red-500'
          >
            {messageCounts.error}
          </span>
        {/if}
      </div>
    </div>

    <div class='flex items-center gap-2'>
      <Button
        size='icon'
        variant='destructive'
        onclick={() => {
          haptic()
          messages = []
          toast.success('Cleared console')
        }}
      >
        <Trash2Icon size={14} />
        <span class='sr-only'>Clear</span>
      </Button>
      <Button size='icon' variant='outline' onclick={toggle}>
        <ChevronUp
          size={14}
          class={cn(
            'transition-transform',
            isCollapsed ? '' : '-rotate-180',
          )}
        />
        <span class='sr-only'>{isCollapsed ? 'Show' : 'Hide'}</span>
      </Button>
    </div>
  </div>
  <div
    class={cn(
      'border-t flex px-4 flex-col overflow-y-scroll transition-[height]',
      isCollapsed ? 'h-0' : 'h-72',
    )}
  >
    {#each messages as message}
      {@render consoleMessage(message)}
    {/each}
    <div class='mt-2'></div>
  </div>
</div>

{#snippet consoleMessage(message: ConsoleAction, inHeader: boolean = false)}
  {@const { data, type } = message}
  <div
    class={cn(
      'px-3 py-2 text-xs overflow-clip shrink-0 border flex items-center gap-3 rounded-md',
      type === 'error'
        ? 'bg-red-500/10 text-red-500'
        : type === 'warn'
        ? 'bg-yellow-500/10 text-yellow-500'
        : '',
      inHeader ? 'grow transition-opacity' : 'mt-2',
      inHeader && !isCollapsed ? 'opacity-0' : '',
    )}
  >
    <div class='flex items-center gap-2'>
      {#if type === 'error'}
        <CircleXIcon size={14} />
      {:else if type === 'warn'}
        <TriangleAlertIcon size={14} />
      {/if}
    </div>
    <div class='font-mono whitespace-pre-wrap'>
      {#each data as item}
        {#if item?.__isError}
          <span class='font-bold'>{item.message.trim()}</span>
          <span class='text-zinc-400 dark:text-zinc-600 text-xs'>
            {item.stack}
          </span>
        {:else if item?.__isTrace}
          <span class='text-zinc-400 dark:text-zinc-600 text-xs'>
            {item.stack}
          </span>
        {:else}
          {JSON.stringify(item, null, 2)}
        {/if}
      {/each}
    </div>
  </div>
{/snippet}
