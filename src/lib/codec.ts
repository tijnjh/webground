import { Micro, pipe } from 'effect'
import { TaggedError as TaggedErr } from 'effect/Data' // need to alias this to avoid eslint error ;-:
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'

export class EncodingError extends TaggedErr('EncodingError')<{ message: string }> {}

export function encode(str: string) {
  return Micro.try({
    try: () => pipe(
      str,
      strToU8,
      deflateSync,
      v => String.fromCharCode(...v),
      btoa,
      v => v.replaceAll('=', ''),
      v => v.replaceAll('+', '~'),
      v => v.replaceAll('/', '_'),
    ),
    catch: error => new EncodingError({ message: `failed to encode: ${error}` }),
  })
}

export class DecodingError extends TaggedErr('DecodingError')<{ message: string }> {}

export function decode(str: string) {
  return Micro.try({
    try: () => pipe(
      str,
      padBase64,
      v => v.replaceAll('~', '+'),
      v => v.replaceAll('_', '/'),
      atob,
      v => Uint8Array.from(v, (c: string) => c.charCodeAt(0)),
      inflateSync,
      strFromU8,
    ),
    catch: () => new DecodingError({ message: 'failed to decode' }),
  })
}

export function padBase64(input: string) {
  const segmentLength = 4
  const stringLength = input.length
  const diff = stringLength % segmentLength

  if (!diff) {
    return input
  }

  let padLength = segmentLength - diff
  let buffer = input

  while (padLength--) {
    buffer += '='
  }
  return buffer.toString()
}
