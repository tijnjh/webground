import type { LinkShareUnion } from './types';
import { browser } from '$app/environment';
import { Data, Effect } from 'effect';
import { codeState } from './code-state.svelte';
import { encode } from './codec';

export class CopyLinkError extends Data.TaggedError('CopyLinkError')<{ message: string }> {}

export const createShareUrl = Effect.fn(function* () {
	const code = codeState.current;

	const [html, css, js] = yield* Effect.all([encode(code.html), encode(code.css), encode(code.js)]);

	const url = new URL(browser ? location.origin : 'http://localhost:5173');

	if (code.html) url.searchParams.set('h', html);
	if (code.css) url.searchParams.set('c', css);
	if (code.js) url.searchParams.set('j', js);

	return url;
});

export const createShareableString = Effect.fn(function* (
	url: URL,
	mode: LinkShareUnion,
	title: string
) {
	const urlString = url.toString();

	switch (mode) {
		case 'full':
			return urlString;
		case 'markdown':
			return `[${title}](${urlString})`;
		case 'html':
			return `<a href="${urlString}">${title}</a>`;
		default:
			return yield* Effect.fail(
				new CopyLinkError({ message: `copy link type "${mode}" is not supported.` })
			);
	}
});

export const copyLink = Effect.fn(function* ({
	mode,
	title
}: {
	mode: LinkShareUnion;
	title: string;
}) {
	const url = yield* createShareUrl();
	const shareableString = yield* createShareableString(url, mode, title);

	yield* Effect.tryPromise({
		try: () => navigator.clipboard.writeText(shareableString),
		catch: () => new CopyLinkError({ message: 'Failed to copy to clipboard' })
	});

	return {
		isLong: url.toString().length > 2048
	};
});
