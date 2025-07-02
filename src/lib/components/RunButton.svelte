<script lang="ts">
  import { haptic } from "ios-haptics";
  import Button from "./ui/button/button.svelte";
  import { updatePreview } from "./Preview.svelte";
  import { TerminalIcon } from "@lucide/svelte";
  import { codeState } from "$lib/code-state.svelte";
  import { Effect } from "effect";
  import { toast } from "svelte-sonner";
</script>

<Button
  onclick={() => {
    Effect.runPromise(updatePreview(codeState.current))
      .then(({ didUpdate }) => didUpdate && haptic.confirm())
      .catch((error) => {
        console.error(error);
        haptic.error();
        toast.error(JSON.stringify(error));
      });
  }}
>
  <TerminalIcon size={16} />
  Run
</Button>
