<script lang='ts'>
  import { Toaster } from '$lib/components/ui/sonner/index.js'
  import { useIsMobile } from '$lib/hooks.svelte'
  import { ModeWatcher } from 'mode-watcher'
  import '../app.css'

  const { children } = $props()

  const isMobile = useIsMobile()
</script>

<ModeWatcher />
<Toaster richColors position={isMobile ? 'top-center' : 'bottom-right'} />

{@render children()}
