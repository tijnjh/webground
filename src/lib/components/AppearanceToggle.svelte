<script lang="ts">
  import MoonIcon from "@lucide/svelte/icons/moon";
  import SunIcon from "@lucide/svelte/icons/sun";
  import { Button } from "$lib/components/ui/button/index.js";
  import { haptic } from "ios-haptics";
  import { mode, toggleMode } from "mode-watcher";
  import { setTheme } from "./Monaco.svelte";
</script>

<Button
  onclick={() => {
    haptic();
    toggleMode();
    if (!mode.current) return;
    setTheme(`vs-${mode.current}`);
  }}
  variant="outline"
  size="icon"
>
  <SunIcon
    class="w-[1.2rem] h-[1.2rem] rotate-0 dark:-rotate-90 scale-100 dark:scale-0 !transition-all"
  />
  <MoonIcon
    class="absolute w-[1.2rem] h-[1.2rem] rotate-90 dark:rotate-0 scale-0 dark:scale-100 !transition-all"
  />
  <span class="sr-only">Toggle theme</span>
</Button>
