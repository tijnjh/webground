<script lang="ts">
	import type { LinkShareUnion } from '$lib/types';
	import { codeState } from '$lib/code-state.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { useIsMobile, useIsShared } from '$lib/hooks.svelte';
	import { localStore } from '$lib/utils';
	import {
		EllipsisIcon,
		CodeIcon,
		LinkIcon,
		PencilIcon,
		ShareIcon,
		Trash2Icon
	} from '@lucide/svelte';
	import { Effect } from 'effect';
	import { toast } from 'svelte-sonner';
	import { copyLink } from '../sharing';
	import AppearanceToggle from './AppearanceToggle.svelte';
	import LangSwitcher from './LangSwitcher.svelte';
	import RunButton from './RunButton.svelte';

	const isMobile = useIsMobile();
	const isShared = useIsShared();

	let title = $state('');
</script>

<div class="flex items-center justify-between gap-2 p-4">
	<div class="flex items-center gap-3">
		<div class="flex items-center gap-2">
			<Popover.Root>
				<Popover.Trigger>
					<Button size="icon" variant="outline" aria-label="Toggle menu">
						<EllipsisIcon size={16} />
						<span class="sr-only">Menu</span>
					</Button>
				</Popover.Trigger>

				<Popover.Content align="start">
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<h1>Webground</h1>
							<AppearanceToggle />
						</div>

						<Separator class="my-2" />

						<Button class="w-full" href="https://github.com/tijnjh/webground">
							<CodeIcon size={16} />
							View source
						</Button>

						{#if !isShared}
							<Separator class="my-2" />
							<Popover.Root>
								<Popover.Trigger>
									<Button class="w-full" variant="destructive">
										<Trash2Icon size={16} />
										Clear all code
									</Button>
								</Popover.Trigger>
								<Popover.Content align="start">
									<p class="mb-2">Are you sure you want to your clear your code?</p>

									<Separator class="my-4" />

									<Popover.Close class="w-full">
										<Button
											class="w-full"
											variant="destructive"
											onclick={() => {
												codeState.clear();
												toast.success('Cleared code');
											}}
										>
											Confirm
										</Button>
									</Popover.Close>
								</Popover.Content>
							</Popover.Root>
						{/if}
					</div>
				</Popover.Content>
			</Popover.Root>

			<Popover.Root>
				<Popover.Trigger>
					<Button variant="outline">
						<ShareIcon size={16} />
						Share
					</Button>
				</Popover.Trigger>
				<Popover.Content align="start">
					<div class="flex flex-col gap-2">
						<h3>Link sharing</h3>

						<Separator class="my-2" />

						{@render shareButton('full', 'Full URL')}

						<Separator class="my-2" />

						<label class="mb-2 flex items-center justify-between gap-4">
							<span>Title</span>
							<input
								type="text"
								placeholder="Shared code"
								class="min-w-0 text-right outline-none"
								bind:value={title}
							/>
						</label>

						{@render shareButton('markdown', 'Markdown')}
						{@render shareButton('html', 'HTML')}
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>

	{#if !isMobile.current}
		<LangSwitcher />
	{/if}

	<div class="flex items-center gap-2">
		{#if isShared}
			<Button
				onclick={() => {
					Effect.runSync(localStore('code', codeState.current));
					location.href = location.href.split('?')[0];
				}}
			>
				<PencilIcon size={16} />
				Edit
			</Button>
		{/if}

		{#if !isMobile.current}
			<RunButton />
		{/if}
	</div>
</div>

{#snippet shareButton(mode: LinkShareUnion, label: string)}
	<Popover.Close>
		<Button
			onclick={() => {
				Effect.runPromise(copyLink({ mode, title }))
					.then((res) => {
						toast.success(`Copied link (${mode}) to clipboard`);

						if (res.isLong) {
							setTimeout(() => {
								toast.warning(
									'URL is longer than 2048 characters, which might cause issues in certain browsers'
								);
							}, 300);
						}
					})
					.catch((error) => {
						toast.error(error.message);
					});
			}}
			class="w-full"
		>
			<LinkIcon size={16} />
			{label}
		</Button>
	</Popover.Close>
{/snippet}
