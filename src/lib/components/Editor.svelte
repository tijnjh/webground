<script lang="ts">
  import { µ } from "$lib/global.svelte";
  import { checkIfShared } from "$lib/utils";
  import MenuBar from "./MenuBar.svelte";
  import Monaco from "./Monaco.svelte";

  const isShared = checkIfShared().unwrapOr(false);
</script>

<div class="relative grid grid-rows-[min-content_1fr] dark:bg-[#1e1e1e] h-full overflow-hidden width-screen">
  <MenuBar />

  <div class="isolate *:absolute relative *:inset-0 *:h-full *:transition-[filter] *:duration-500">
    {#each [["html", "html"], ["css", "css"], ["js", "javascript"]] as
      [lang, language]
    }
      {#if µ.currentTab === lang}
        <div>
          <Monaco {lang} {language} readOnly={isShared} />
        </div>
      {/if}
    {/each}
  </div>
</div>
