import assert from "node:assert/strict";
import { test } from "node:test";

import {
  InvitePersistenceConfigurationError,
  readInvitePersistenceEnvironment,
  resolveInvitePersistenceMode
} from "../src/lib/storage/invite-store-config";

const configured = {
  serviceRoleKey: "service-secret-value",
  supabaseUrl: "https://example.supabase.co"
};

test("local development without Supabase variables uses memory", () => {
  assert.equal(
    resolveInvitePersistenceMode({
      nodeEnv: "development"
    }),
    "memory"
  );
});

test("test environment without Supabase variables uses memory", () => {
  assert.equal(
    resolveInvitePersistenceMode({
      nodeEnv: "test"
    }),
    "memory"
  );
});

test("local development with Supabase variables uses Supabase", () => {
  assert.equal(
    resolveInvitePersistenceMode({
      nodeEnv: "development",
      ...configured
    }),
    "supabase"
  );
});

test("Vercel Preview with Supabase variables uses Supabase", () => {
  assert.equal(
    resolveInvitePersistenceMode({
      nodeEnv: "production",
      vercel: "1",
      vercelEnv: "preview",
      ...configured
    }),
    "supabase"
  );
});

test("Vercel Production with Supabase variables uses Supabase", () => {
  assert.equal(
    resolveInvitePersistenceMode({
      nodeEnv: "production",
      vercel: "1",
      vercelEnv: "production",
      ...configured
    }),
    "supabase"
  );
});

test("Preview missing Supabase URL fails closed", () => {
  assertPersistenceError(
    {
      nodeEnv: "production",
      serviceRoleKey: configured.serviceRoleKey,
      vercel: "1",
      vercelEnv: "preview"
    },
    ["NEXT_PUBLIC_SUPABASE_URL"]
  );
});

test("Preview missing service key fails closed", () => {
  assertPersistenceError(
    {
      nodeEnv: "production",
      supabaseUrl: configured.supabaseUrl,
      vercel: "1",
      vercelEnv: "preview"
    },
    ["SUPABASE_SERVICE_ROLE_KEY"]
  );
});

test("Preview missing both Supabase variables fails closed", () => {
  assertPersistenceError(
    {
      nodeEnv: "production",
      vercel: "1",
      vercelEnv: "preview"
    },
    ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  );
});

test("Production missing Supabase URL fails closed", () => {
  assertPersistenceError(
    {
      nodeEnv: "production",
      serviceRoleKey: configured.serviceRoleKey,
      vercel: "1",
      vercelEnv: "production"
    },
    ["NEXT_PUBLIC_SUPABASE_URL"]
  );
});

test("Production missing service key fails closed", () => {
  assertPersistenceError(
    {
      nodeEnv: "production",
      supabaseUrl: configured.supabaseUrl,
      vercel: "1",
      vercelEnv: "production"
    },
    ["SUPABASE_SERVICE_ROLE_KEY"]
  );
});

test("Production missing both Supabase variables fails closed", () => {
  assertPersistenceError(
    {
      nodeEnv: "production",
      vercel: "1",
      vercelEnv: "production"
    },
    ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  );
});

test("generic production runtime without Supabase variables fails closed", () => {
  assertPersistenceError(
    {
      nodeEnv: "production"
    },
    ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  );
});

test("whitespace-only Supabase values are treated as missing", () => {
  assertPersistenceError(
    {
      nodeEnv: "production",
      serviceRoleKey: "   ",
      supabaseUrl: "\t",
      vercel: "1",
      vercelEnv: "preview"
    },
    ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  );
});

test("resolver output is deterministic", () => {
  const environment = {
    nodeEnv: "production",
    vercel: "1",
    vercelEnv: "preview",
    ...configured
  };

  assert.equal(resolveInvitePersistenceMode(environment), "supabase");
  assert.equal(resolveInvitePersistenceMode(environment), "supabase");
});

test("configuration errors do not include secret values", () => {
  assert.throws(
    () =>
      resolveInvitePersistenceMode({
        nodeEnv: "production",
        serviceRoleKey: "super-secret-service-role-value",
        vercel: "1",
        vercelEnv: "preview"
      }),
    (error) => {
      assert.ok(error instanceof InvitePersistenceConfigurationError);
      assert.equal(error.code, "INVITE_PERSISTENCE_NOT_CONFIGURED");
      assert.doesNotMatch(error.message, /super-secret-service-role-value/);
      assert.match(error.message, /NEXT_PUBLIC_SUPABASE_URL/);

      return true;
    }
  );
});

test("environment reader maps process env names without exposing values", () => {
  assert.deepEqual(
    readInvitePersistenceEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NODE_ENV: "production",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      VERCEL: "1",
      VERCEL_ENV: "preview"
    }),
    {
      nodeEnv: "production",
      serviceRoleKey: "service-key",
      supabaseUrl: "https://example.supabase.co",
      vercel: "1",
      vercelEnv: "preview"
    }
  );
});

function assertPersistenceError(
  environment: Parameters<typeof resolveInvitePersistenceMode>[0],
  missingVariables: string[]
) {
  assert.throws(
    () => resolveInvitePersistenceMode(environment),
    (error) => {
      assert.ok(error instanceof InvitePersistenceConfigurationError);
      assert.equal(error.code, "INVITE_PERSISTENCE_NOT_CONFIGURED");
      assert.deepEqual(error.missingVariables, missingVariables);
      assert.doesNotMatch(error.message, /service-secret-value/);
      assert.doesNotMatch(error.message, /https:\/\/example\.supabase\.co/);

      return true;
    }
  );
}
