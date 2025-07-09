<script lang='ts'>
  import { codeState } from '$lib/code-state.svelte'
  import { TerminalIcon } from '@lucide/svelte'
  import { haptic } from 'ios-haptics'
  import { updatePreview } from './Preview.svelte'
  import Button from './ui/button/button.svelte'
</script>

<Button
  onclick={() => {
    const didUpdate = updatePreview(codeState.current)
    if (didUpdate) {
      haptic.confirm()
    }
  }}
>
  <TerminalIcon size={16} />
  Run
</Button>
