import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  generateSenderAccessToken,
  hashSenderAccessToken,
  isValidSenderAccessToken,
  senderAccessTokenByteLength,
  senderAccessTokenLength
} from "../src/lib/sender-access-token";

test("sender access token is URL-safe with explicit entropy and length", () => {
  const token = generateSenderAccessToken();

  assert.equal(senderAccessTokenByteLength, 32);
  assert.equal(senderAccessTokenLength, 43);
  assert.equal(token.length, senderAccessTokenLength);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
  assert.equal(isValidSenderAccessToken(token), true);
});

test("generated sender access tokens differ", () => {
  const firstToken = generateSenderAccessToken();
  const secondToken = generateSenderAccessToken();

  assert.notEqual(firstToken, secondToken);
});

test("sender access token hash is deterministic and not plaintext", () => {
  const token = "A".repeat(senderAccessTokenLength);
  const hash = hashSenderAccessToken(token);

  assert.equal(hash, hashSenderAccessToken(token));
  assert.notEqual(hash, token);
  assert.match(hash, /^[a-f0-9]{64}$/);
});

test("malformed sender access tokens are rejected", () => {
  for (const token of [
    "",
    " ",
    "short",
    "A".repeat(senderAccessTokenLength - 1),
    "A".repeat(senderAccessTokenLength + 1),
    "A".repeat(senderAccessTokenLength - 1) + "=",
    "A".repeat(senderAccessTokenLength - 1) + "+"
  ]) {
    assert.equal(isValidSenderAccessToken(token), false);
  }
});

test("sender token utility has no external dependency or error leakage", () => {
  const source = readFileSync("src/lib/sender-access-token.ts", "utf8");

  assert.match(source, /node:crypto/);
  assert.doesNotMatch(source, /throw new Error/);
  assert.doesNotMatch(source, /console\./);
  assert.doesNotMatch(source, /@supabase|fetch\(|localStorage|document\.cookie/);
});
