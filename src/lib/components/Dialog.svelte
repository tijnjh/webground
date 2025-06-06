<script lang="ts">
  import type { Snippet } from "svelte";
  import { fly } from "svelte/transition";

  interface Props {
    children: Snippet;
    open: boolean;
  }

  let { children, open = $bindable() }: Props = $props();

  let dialog: HTMLDivElement | null = $state(null);

  function handleDocumentClick(event: MouseEvent) {
    if (!dialog || !open) return;
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
    class="right-4 md:right-auto left-4 md:left-auto z-[100] fixed bg-white shadow mt-2 p-4 border border-gray-100 rounded-md md:w-72 font-medium text-black text-sm"
  >
    {@render children()}
  </div>
{/if}
