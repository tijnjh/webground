<script lang="ts">
  import type { Snippet } from "svelte";
  import { fly } from "svelte/transition";

  type Props = { children: Snippet; open: boolean };
  let { children, open = $bindable() }: Props = $props();

  let dialog: HTMLDivElement | null = $state(null);

  function handleDocumentClick(event: MouseEvent) {
    if (!dialog) return;
    if (!open) return;
    if (!dialog.contains(event.target as Node)) {
      open = false;
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener("mousedown", handleDocumentClick);
    } else {
      document.removeEventListener("mousedown", handleDocumentClick);
    }
  });
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") {
      open = false;
    }
  }}
/>

{#if open}
  <div
    bind:this={dialog}
    transition:fly={{ y: 10, duration: 200 }}
    class="z-[100] fixed left-4 right-4 z-50 rounded-md mt-2 border border-gray-100 shadow bg-white p-4 text-sm font-medium text-black md:left-auto md:right-auto md:w-72 dark:border-[#1B1F23] dark:bg-[#24292F] dark:text-white"
  >
    {@render children()}
  </div>
{/if}
