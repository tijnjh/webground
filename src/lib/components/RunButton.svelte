<script lang='ts'>
  import { codeState } from '$lib/code-state.svelte'
  import { TerminalIcon } from '@lucide/svelte'
  import { Micro } from 'effect'
  import { haptic } from 'ios-haptics'
  import { toast } from 'svelte-sonner'
  import { updatePreview } from './Preview.svelte'
  import Button from './ui/button/button.svelte'
</script>

<Button
  onclick={() => {
    Micro.runPromise(updatePreview(codeState.current))
      .then(({ didUpdate }) => didUpdate && haptic.confirm())
      .catch((error) => {
        console.error(error)
        haptic.error()
        toast.error(JSON.stringify(error))
      })
  }}
>
  <TerminalIcon size={16} />
  Run
</Button>
