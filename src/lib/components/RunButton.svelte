<script lang="ts">
  import { haptic } from "ios-haptics";
  import Button from "./ui/button/button.svelte";
  import { updatePreview } from "./Preview.svelte";
  import { TerminalIcon } from "@lucide/svelte";
  import { µ } from "$lib/global.svelte";
</script>

<Button
  onclick={() => {
    const didUpdate = updatePreview(µ.code);
    if (didUpdate) {
      haptic.confirm();
    }
  }}
>
  <TerminalIcon size={16} />
  Run
</Button>
