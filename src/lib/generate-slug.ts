import { randomBytes } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generateSlug(length = 10): string {
  if (length < 8 || length > 10) {
    throw new Error("Slug length must be between 8 and 10 characters.");
  }

  const bytes = getRandomBytes(length);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function getRandomBytes(length: number): Uint8Array {
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);

    return bytes;
  }

  return randomBytes(length);
}
