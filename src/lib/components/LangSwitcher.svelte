<script lang="ts">
  import { haptic } from "ios-haptics";
  import { isMobile } from "../helpers";
  import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
  import type { LangUnion } from "../types";

  let { currentTab = $bindable() }: { currentTab: LangUnion } = $props();

  let value: string[] = $state(["html"]);

  $effect(() => {
    if (value.length >= 2) {
      value.shift();
    }
  });

  function setHashLang(lang: LangUnion) {
    window.location.hash = "#" + lang;
    currentTab = lang;
  }
</script>

<ToggleGroup.Root
  variant="outline"
  type="multiple"
  bind:value
  class={isMobile ? "ml-2" : ""}
>
  {@render langButton("html")}
  {@render langButton("css")}
  {@render langButton("js")}
</ToggleGroup.Root>

{#snippet langButton(lang: LangUnion)}
  <ToggleGroup.Item
    onclick={() => {
      if (currentTab !== lang) {
        haptic();
        setHashLang(lang);
      }
    }}
    value={lang}
    class="px-6"
    data-lang={lang}
  >
    {lang}
  </ToggleGroup.Item>
{/snippet}
