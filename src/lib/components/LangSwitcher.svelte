<script lang="ts">
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import { µ } from "$lib/global.svelte";
  import type { LangUnion } from "$lib/types";
  import { isMobile } from "$lib/utils";
  import { haptic } from "ios-haptics";

  let value: LangUnion = $state("html");

  $effect(() => {
    window.location.hash = "#" + value;
    µ.currentTab = value;
  });
</script>

<ToggleGroup.Root
  variant="outline"
  type="single"
  bind:value
  class={isMobile ? "ml-2" : ""}
>
  {@render langTab("html")}
  {@render langTab("css")}
  {@render langTab("js")}
</ToggleGroup.Root>

{#snippet langTab(lang: LangUnion)}
  <ToggleGroup.Item
    onclick={(e) => {
      if (µ.currentTab !== lang) {
        haptic();
      } else {
        e.preventDefault();
      }
    }}
    value={lang}
    class="px-6"
  >
    {lang}
  </ToggleGroup.Item>
{/snippet}
