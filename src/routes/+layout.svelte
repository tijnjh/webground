<script lang="ts">
  import { Toaster } from "$lib/components/ui/sonner/index.js";
  import "../app.css";

  let { children } = $props();
</script>

<Toaster richColors />

{@render children()}
