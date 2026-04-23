<script lang="ts">
	import type { Code } from '$lib/types';
	import { codeState } from '$lib/code-state.svelte';
	import { decode } from '$lib/codec';
	import Console from '$lib/components/Console.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import LangSwitcher from '$lib/components/LangSwitcher.svelte';
	import Preview, { updatePreview } from '$lib/components/Preview.svelte';
	import RunButton from '$lib/components/RunButton.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { µ } from '$lib/global.svelte';
	import { useIsMobile, useIsShared } from '$lib/hooks.svelte';
	import { extractCodeParams, localStore, setTabFromHash } from '$lib/utils';
	import { ChevronUpIcon } from '@lucide/svelte';
	import { Effect } from 'effect';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const isMobile = useIsMobile();
	const isShared = useIsShared();

	let showMobilePreview = $state(false);

	onMount(async () => {
		if (isShared) {
			const { h, c, j } = extractCodeParams();

			const decoded = await Effect.runPromiseExit(
				Effect.all(
					[
						h ? decode(h) : Effect.succeed(''),
						c ? decode(c) : Effect.succeed(''),
						j ? decode(j) : Effect.succeed('')
					],
					{ concurrency: 3 }
				)
			);

			if (decoded._tag === 'Failure') {
				toast.error(decoded.cause.reasons.map((r) => r.toString()).join(', '));
				console.error(decoded.cause);
				return;
			}

			const [html, css, js] = decoded.value;

			codeState.current = { html, css, js };
		} else {
			const codeResult = await Effect.runPromiseExit(localStore<Code>('code') || {});

			if (codeResult._tag === 'Success') {
				const code = codeResult.value;
				for (const [key, val] of Object.entries(code)) {
					codeState.current[key as keyof Code] = val as string;
				}
			} else {
				console.error('Failed to retrieve code from localStorage:', codeResult.cause);
			}
		}

		setTabFromHash(µ.currentTab, codeState.current);
	});
</script>

<svelte:window
	onhashchange={() => void setTabFromHash(µ.currentTab, codeState.current)}
	onkeydown={async (e) => {
		if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter')) {
			e.preventDefault();
			await Effect.runPromise(updatePreview());
		}
	}}
/>

{#if !isMobile.current}
	<!-- desktop layout -->
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane defaultSize={50} class="h-dvh">
			<Editor />
		</Resizable.Pane>

		<Resizable.Handle />

		<Resizable.Pane defaultSize={50}>
			<div class="flex h-full flex-col">
				<Preview class="size-full grow" />
				<Console />
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
{:else}
	<!-- mobile layout -->
	<div class="grid h-dvh grid-rows-[1fr_min-content]">
		<Editor />

		<LangSwitcher class="fixed bottom-20 left-4 bg-white dark:bg-[#1e1e1e]" />

		<div class="flex items-center justify-between border-t bg-white p-4 dark:bg-[#1e1e1e]">
			<Button
				onclick={() => {
					showMobilePreview = !showMobilePreview;
				}}
			>
				<div class="transition-transform" class:rotate-x-180={showMobilePreview}>
					<ChevronUpIcon />
				</div>
				Preview
			</Button>
			<RunButton />
		</div>
	</div>

	{#if showMobilePreview}
		<div class="fixed top-17 bottom-17 isolate flex w-full flex-col">
			<Preview class="grow" />
			<Console />
		</div>
	{/if}
{/if}
