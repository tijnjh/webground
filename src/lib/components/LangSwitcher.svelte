<script lang="ts">
  import { haptic } from "ios-haptics";
  import { isMobile } from "../helpers";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import type { LangUnion } from "../types";

  let { currentTab = $bindable() }: { currentTab: LangUnion } = $props();

  let value: LangUnion = $state("html");

  $effect(() => {
    window.location.hash = "#" + value;
    currentTab = value;
  });
</script>

<ToggleGroup.Root
  variant="outline"
  type="single"
  bind:value
  class={isMobile ? "ml-2" : ""}
>
  {@render langButton("html")}
  {@render langButton("css")}
  {@render langButton("js")}
</ToggleGroup.Root>

{#snippet langButton(lang: LangUnion)}
  <ToggleGroup.Item
    onclick={(e) => {
      if (currentTab !== lang) {
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
