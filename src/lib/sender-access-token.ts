import { createHash, randomBytes } from "node:crypto";

export const senderAccessTokenByteLength = 32;
export const senderAccessTokenLength = 43;

const senderAccessTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function generateSenderAccessToken(): string {
  return randomBytes(senderAccessTokenByteLength).toString("base64url");
}

export function hashSenderAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidSenderAccessToken(token: string): boolean {
  return senderAccessTokenPattern.test(token);
}
