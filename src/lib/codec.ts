import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";

export function encode(str: string) {
  let encoded;

  try {
    encoded = str;
    encoded = strToU8(str);
    encoded = deflateSync(encoded);
    encoded = btoa(String.fromCharCode.apply(null, [...encoded]));
    encoded = encoded.replace(/=/g, "").replace(/\+/g, "~").replace(
      /\//g,
      "_",
    );
  } catch (err) {
    throw new Error(`Failed to encode: ${err}`);
  }

  return encoded;
}

export function decode(str: string) {
  let decoded;

  try {
    decoded = str;
    decoded = padBase64(decoded);
    decoded = decoded.replace(/\~/g, "+").replace(/_/g, "/");
    decoded = atob(decoded);
    decoded = Uint8Array.from(decoded, (c: string) => c.charCodeAt(0));
    decoded = inflateSync(decoded);
    decoded = strFromU8(decoded);
  } catch (err) {
    throw new Error(`Failed to encode: ${err}`);
  }

  return decoded;
}

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
    buffer += "=";
  }
  return buffer.toString();
}
