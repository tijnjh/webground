<script lang="ts">
	import { TerminalIcon } from '@lucide/svelte';
	import { Effect } from 'effect';
	import { toast } from 'svelte-sonner';
	import { updatePreview } from './Preview.svelte';
	import Button from './ui/button/button.svelte';
</script>

<Button
	onclick={() => {
		Effect.runPromise(updatePreview())
			.then(({ didUpdate }) => didUpdate && haptic.confirm())
			.catch((error) => {
				console.error(error);
				toast.error(JSON.stringify(error));
			});
	}}
>
	<TerminalIcon size={16} />
	Run
</Button>
