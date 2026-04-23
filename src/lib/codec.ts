import { Data, Effect, pipe } from 'effect';
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';

export class EncodingError extends Data.TaggedError('EncodingError')<{ message: string }> {}

export const encode = (str: string) =>
	Effect.try({
		try: () =>
			pipe(
				str,
				(x) => strToU8(x),
				(x) => deflateSync(x),
				(x) => String.fromCharCode(...x),
				(x) => btoa(x),
				(x) => x.replaceAll('=', ''),
				(x) => x.replaceAll('+', '~'),
				(x) => x.replaceAll('/', '_')
			),
		catch: (error) => new EncodingError({ message: `failed to encode: ${error}` })
	});

export class DecodingError extends Data.TaggedError('DecodingError')<{ message: string }> {}

export const decode = (str: string) =>
	Effect.try({
		try: () =>
			pipe(
				str,
				(x) => padBase64(x),
				(x) => x.replaceAll('~', '+'),
				(x) => x.replaceAll('_', '/'),
				(x) => atob(x),
				(x) => Uint8Array.from(x, (c) => c.charCodeAt(0)),
				(x) => inflateSync(x),
				(x) => strFromU8(x)
			),
		catch: () => new DecodingError({ message: 'failed to decode' })
	});

export function padBase64(input: string) {
	const segmentLength = 4;
	const stringLength = input.length;
	const diff = stringLength % segmentLength;

	if (!diff) {
		return input;
	}

	let padLength = segmentLength - diff;
	let buffer = input;

	while (padLength--) {
		buffer += '=';
	}
	return buffer.toString();
}
