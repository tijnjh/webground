import { Micro, pipe } from 'effect'
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate'

export function encode(str: string): Micro.Micro<string, Error> {
  return Micro.try({
    try: () =>
      pipe(
        str,
        strToU8,
        deflateSync,
        v => String.fromCharCode(...v),
        btoa,
        v => v.replaceAll('=', ''),
        v => v.replaceAll('+', '~'),
        v => v.replaceAll('/', '_'),
      ),

    catch: error => new Error(`failed to encode: ${error}`) as Error,
  })
}

export function decode(str: string): Micro.Micro<string, Error> {
  return Micro.try({
    try: () =>
      pipe(
        str,
        padBase64,
        v => v.replaceAll('~', '+'),
        v => v.replaceAll('_', '/'),
        atob,
        v => Uint8Array.from(v, (c: string) => c.charCodeAt(0)),
        inflateSync,
        strFromU8,
      ),
    catch: error => new Error(`failed to decode: ${error}`) as Error,
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
