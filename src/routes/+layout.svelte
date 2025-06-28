<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import { isMobile } from "$lib/utils";
  import "@fontsource/dm-mono";
  import { ModeWatcher } from "mode-watcher";
  import "../app.css";

  let { children } = $props();
</script>

<ModeWatcher />
<Toaster richColors position={isMobile ? "top-center" : "bottom-right"} />

{@render children()}
