<script lang="ts">
  import type { ConsoleAction } from "$lib/types";
  import { cn } from "$lib/utils";
  import {
    CircleXIcon,
    Trash2Icon,
    TriangleAlertIcon,
  } from "@lucide/svelte";
  import Button from "./ui/button/button.svelte";

  let messages: ConsoleAction[] = $state([]);
  let isCollapsed = $state(false);

  function onmessage(e: MessageEvent) {
    const data = e.data as ConsoleAction;

    if (e.data.__webground) {
      messages.unshift(data);
    }
  }
</script>

<svelte:window
  {onmessage}
  onkeydown={(e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
      e.preventDefault();
      isCollapsed = !isCollapsed;
    }
  }}
/>

<div class="bg-zinc-100 dark:bg-zinc-900 border-t">
  <div class="flex justify-between items-center gap-4 bg-white dark:bg-zinc-800 px-4 py-2">
    <h3>Console</h3>

    {#if messages[0]}
      {@render consoleMessage(messages[0], true)}
    {/if}

    <div class="flex gap-2">
      <Button variant="outline" onclick={() => void (messages = [])}>
        <Trash2Icon />
        <span class="sr-only">Clear</span>
      </Button>
      <Button
        variant="outline"
        class="w-18"
        onclick={() => void (isCollapsed = !isCollapsed)}
      >
        {isCollapsed ? "Show" : "Hide"}
      </Button>
    </div>
  </div>
  <div
    class={cn([
      "border-t flex px-2 flex-col overflow-y-scroll transition-[height] ",
      isCollapsed ? "h-0" : "h-72",
    ])}
  >
    {#each messages as message}
      {@render consoleMessage(message)}
    {/each}
    <div class="mt-2"></div>
  </div>
</div>

{#snippet consoleMessage(message: ConsoleAction, inHeader: boolean = false)}
  {@const { data, type } = message}
  <div
    class={cn([
      "px-3 h-9 text-sm shrink-0 border flex items-center gap-2 rounded-md ",
      type === "error" && "bg-destructive/25 text-destructive",
      type === "warn" && "bg-yellow-500/25 text-yellow-500",
      inHeader ? "grow transition-opacity" : "mt-2",
      inHeader && !isCollapsed ? "opacity-0" : "",
    ])}
  >
    {#if ["warn", "error"].includes(type)}
      {@const Icon = type === "warn" ? TriangleAlertIcon : CircleXIcon}
      <Icon size={14} />
    {/if}
    {data}
  </div>
{/snippet}
