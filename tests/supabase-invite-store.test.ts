import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  createDefaultInviteStore,
  InMemoryInviteStore,
  shouldUseSupabaseInviteStore
} from "../src/lib/invite-store";
import { InvitePersistenceConfigurationError } from "../src/lib/storage/invite-store-config";
import type { CreateInviteInput } from "../src/lib/invite-store";
import {
  inviteFromSupabaseRow,
  inviteToSupabaseRow,
  SupabaseInviteStore
} from "../src/lib/storage/invite-store-supabase";
import type {
  SupabaseInviteClient,
  SupabaseInviteRow
} from "../src/lib/storage/invite-store-supabase";

const baseInput: CreateInviteInput = {
  senderName: "Riley",
  recipientName: "Avery",
  message: "Dinner, perhaps?",
  mode: "lawyer",
  tone: "funny",
  dateType: "date",
  dateDetails: {
    startsAt: "2026-06-20T19:30"
  },
  placeDetails: {
    name: "Cafe Lumiere",
    address: "12 Main Street"
  }
};

test("InviteStore selection falls back to memory without Supabase env", () => {
  assert.equal(shouldUseSupabaseInviteStore({}), false);
  assert.equal(
    shouldUseSupabaseInviteStore({
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co"
    }),
    false
  );
  assert.ok(createDefaultInviteStore({}) instanceof InMemoryInviteStore);
});

test("deployed InviteStore selection fails closed without Supabase env", () => {
  const deployedEnv = {
    NODE_ENV: "production",
    VERCEL: "1",
    VERCEL_ENV: "preview"
  } as const;

  assert.throws(
    () => createDefaultInviteStore(deployedEnv),
    InvitePersistenceConfigurationError
  );
  assert.throws(
    () =>
      createDefaultInviteStore({
        ...deployedEnv,
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co"
      }),
    InvitePersistenceConfigurationError
  );
  assert.throws(
    () =>
      createDefaultInviteStore({
        ...deployedEnv,
        SUPABASE_SERVICE_ROLE_KEY: "service-role"
      }),
    InvitePersistenceConfigurationError
  );
});

test("InviteStore selection uses Supabase only when service env vars exist", () => {
  const env = {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role"
  };

  assert.equal(shouldUseSupabaseInviteStore(env), true);
  assert.ok(createDefaultInviteStore(env) instanceof SupabaseInviteStore);
});

test("Supabase row mapping preserves the Invite model", async () => {
  const memoryStore = new InMemoryInviteStore({
    slugGenerator: () => "ABCDEFGH"
  });
  const { invite: invite } = await memoryStore.createInvite(baseInput);
  const row = inviteToSupabaseRow(invite, {
    senderTokenHash: "hash-for-row-mapping"
  });

  assert.equal(row.share_slug, invite.slug);
  assert.equal(row.sender_name, invite.senderName);
  assert.equal(row.recipient_name, invite.recipientName);
  assert.equal(row.date_type, invite.dateType);
  assert.equal(row.no_tap_count, 0);
  assert.equal(row.sender_token_hash, "hash-for-row-mapping");
  assert.deepEqual(inviteFromSupabaseRow(row), invite);
});

test("Supabase adapter creates and reads invites with a fake client", async () => {
  const client = new FakeSupabaseInviteClient();
  const store = new SupabaseInviteStore({
    client,
    slugGenerator: () => "ABCDEFGH"
  });

  const { invite: invite } = await store.createInvite(baseInput);
  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(invite.slug, "ABCDEFGH");
  assert.equal(persistedInvite?.senderName, "Riley");
  assert.equal(persistedInvite?.recipientName, "Avery");
});

test("Supabase adapter keeps openedAt write-once", async () => {
  const times = [
    "2026-06-04T10:00:00.000Z",
    "2026-06-04T10:01:00.000Z",
    "2026-06-04T10:02:00.000Z"
  ];
  const store = new SupabaseInviteStore({
    client: new FakeSupabaseInviteClient(),
    now: () => times.shift() ?? "2026-06-04T10:03:00.000Z",
    slugGenerator: () => "ABCDEFGH"
  });
  const { invite: invite } = await store.createInvite(baseInput);
  const firstOpen = await store.markOpened(invite.slug);
  const secondOpen = await store.markOpened(invite.slug);

  assert.equal(firstOpen?.openedAt, "2026-06-04T10:01:00.000Z");
  assert.equal(secondOpen?.openedAt, "2026-06-04T10:01:00.000Z");
  assert.equal(secondOpen?.status, "opened");
});

test("Supabase adapter preview mode blocks persisted writes", async () => {
  const store = new SupabaseInviteStore({
    client: new FakeSupabaseInviteClient(),
    slugGenerator: () => "ABCDEFGH"
  });
  const { invite: invite } = await store.createInvite({
    ...baseInput,
    expiresAt: "2026-06-01T10:00:00.000Z"
  });

  await store.markOpened(invite.slug, { previewMode: true });
  await store.recordNoTap(invite.slug, { previewMode: true });
  await store.respond(invite.slug, {
    previewMode: true,
    response: "yes"
  });
  await store.flagUnknownSender(invite.slug, { previewMode: true });
  await store.cancelInvite(invite.slug, { previewMode: true });
  await store.expireInvites("2026-06-04T10:00:00.000Z", {
    previewMode: true
  });

  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(persistedInvite?.status, "pending");
  assert.equal(persistedInvite?.openedAt, null);
  assert.equal(persistedInvite?.noTapCount, 0);
  assert.equal(persistedInvite?.response, null);
  assert.equal(persistedInvite?.unknownSenderFlaggedAt, null);
  assert.equal(persistedInvite?.canceledAt, null);
  assert.equal(persistedInvite?.expiredAt, null);
});

test("Supabase adapter preserves noTapCount cap and response transitions", async () => {
  const store = new SupabaseInviteStore({
    client: new FakeSupabaseInviteClient(),
    slugGenerator: () => "ABCDEFGH"
  });
  const { invite: invite } = await store.createInvite(baseInput);

  await store.recordNoTap(invite.slug);
  await store.recordNoTap(invite.slug);
  const thirdTap = await store.recordNoTap(invite.slug);

  assert.equal(thirdTap?.noTapCount, 2);

  const raincheck = await store.respond(invite.slug, {
    counterOffer: {
      message: "Maybe next week?",
      selectedOption: "different_day",
      proposedDateIso: "2026-06-25"
    },
    response: "raincheck"
  });

  assert.equal(raincheck?.status, "raincheck");
  assert.equal(raincheck?.response, "raincheck");
  assert.deepEqual(raincheck?.counterOffer, {
    message: "Maybe next week?",
    selectedOption: "different_day",
    proposedDateIso: "2026-06-25"
  });
});

test("Supabase adapter blocks expired response and safety mutations", async () => {
  const store = new SupabaseInviteStore({
    client: new FakeSupabaseInviteClient(),
    now: () => "2026-06-10T12:00:00.000Z",
    slugGenerator: () => "ABCDEFGH"
  });
  const { invite: invite } = await store.createInvite({
    ...baseInput,
    expiresAt: "2026-06-10T12:00:00.000Z"
  });

  const responseResult = await store.respond(invite.slug, {
    counterOffer: {
      message: "Maybe later?"
    },
    response: "raincheck"
  });
  const tapResult = await store.recordNoTap(invite.slug);
  const flagResult = await store.flagUnknownSender(invite.slug);
  const persistedInvite = await store.getInviteBySlug(invite.slug);

  assert.equal(responseResult?.status, "expired");
  assert.equal(responseResult?.response, null);
  assert.equal(responseResult?.counterOffer, null);
  assert.equal(tapResult?.status, "expired");
  assert.equal(flagResult?.status, "expired");
  assert.equal(persistedInvite?.status, "pending");
  assert.equal(persistedInvite?.response, null);
  assert.equal(persistedInvite?.counterOffer, null);
  assert.equal(persistedInvite?.respondedAt, null);
  assert.equal(persistedInvite?.noTapCount, 0);
  assert.equal(persistedInvite?.unknownSenderFlaggedAt, null);
});

test("Supabase schema documents RLS smoke posture without open count", () => {
  const schema = readFileSync("docs/SUPABASE_SCHEMA.md", "utf8");

  assert.match(schema, /alter table public\.invites enable row level security/);
  assert.match(schema, /service-role key/);
  assert.match(schema, /Do not expose the service-role key to the browser/);
  assert.doesNotMatch(schema, /\bopen_count\b/);
});

class FakeSupabaseInviteClient implements SupabaseInviteClient {
  readonly rows = new Map<string, SupabaseInviteRow>();

  from(table: "invites") {
    assert.equal(table, "invites");

    return new FakeSupabaseInviteTable(this.rows);
  }
}

class FakeSupabaseInviteTable {
  constructor(private readonly rows: Map<string, SupabaseInviteRow>) {}

  insert(value: SupabaseInviteRow) {
    return {
      select: () => new FakeSupabaseSingleQuery(this.rows, {}, value)
    };
  }

  select() {
    return new FakeSupabaseListQuery(this.rows);
  }

  update(values: Partial<SupabaseInviteRow>) {
    return new FakeSupabaseMutationQuery(this.rows, values);
  }
}

class FakeSupabaseListQuery {
  private readonly filters: Array<Filter> = [];

  constructor(private readonly rows: Map<string, SupabaseInviteRow>) {}

  eq(column: string, value: unknown) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ column, op: "is", value });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push({ column, op: "not", operator, value });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ column, op: "lte", value });
    return this;
  }

  maybeSingle() {
    const [row = null] = this.matchingRows();

    return Promise.resolve({ data: row ? cloneRow(row) : null, error: null });
  }

  single() {
    return this.maybeSingle();
  }

  select() {
    return this;
  }

  then<TResult1 = QueryListResult, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryListResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve<QueryListResult>({
      data: this.matchingRows().map(cloneRow),
      error: null
    }).then(onfulfilled, onrejected);
  }

  private matchingRows(): SupabaseInviteRow[] {
    return Array.from(this.rows.values()).filter((row) =>
      this.filters.every((filter) => matchesFilter(row, filter))
    );
  }
}

class FakeSupabaseSingleQuery {
  private readonly filters: Array<Filter> = [];

  constructor(
    private readonly rows: Map<string, SupabaseInviteRow>,
    filters: Record<string, unknown>,
    private readonly insertedValue?: SupabaseInviteRow
  ) {
    for (const [column, value] of Object.entries(filters)) {
      this.eq(column, value);
    }
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ column, op: "is", value });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push({ column, op: "not", operator, value });
    return this;
  }

  maybeSingle() {
    if (this.insertedValue) {
      this.rows.set(this.insertedValue.share_slug, cloneRow(this.insertedValue));

      return Promise.resolve({
        data: cloneRow(this.insertedValue),
        error: null
      });
    }

    const [row = null] = Array.from(this.rows.values()).filter((candidate) =>
      this.filters.every((filter) => matchesFilter(candidate, filter))
    );

    return Promise.resolve({ data: row ? cloneRow(row) : null, error: null });
  }

  single() {
    return this.maybeSingle();
  }
}

class FakeSupabaseMutationQuery {
  private readonly filters: Array<Filter> = [];

  constructor(
    private readonly rows: Map<string, SupabaseInviteRow>,
    private readonly values: Partial<SupabaseInviteRow>
  ) {}

  eq(column: string, value: unknown) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ column, op: "is", value });
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push({ column, op: "not", operator, value });
    return this;
  }

  select() {
    const [row = null] = Array.from(this.rows.values()).filter((candidate) =>
      this.filters.every((filter) => matchesFilter(candidate, filter))
    );

    if (!row) {
      return new FakeStaticSingleQuery(null);
    }

    const nextRow = { ...row, ...this.values };
    this.rows.set(nextRow.share_slug, cloneRow(nextRow));

    return new FakeStaticSingleQuery(nextRow);
  }
}

class FakeStaticSingleQuery {
  constructor(private readonly row: SupabaseInviteRow | null) {}

  eq() {
    return this;
  }

  is() {
    return this;
  }

  not() {
    return this;
  }

  maybeSingle() {
    return Promise.resolve({
      data: this.row ? cloneRow(this.row) : null,
      error: null
    });
  }

  single() {
    return this.maybeSingle();
  }
}

interface QueryListResult {
  data: SupabaseInviteRow[];
  error: null;
}

interface Filter {
  column: string;
  op: "eq" | "is" | "lte" | "not";
  operator?: string;
  value: unknown;
}

function matchesFilter(row: SupabaseInviteRow, filter: Filter): boolean {
  const value = row[filter.column as keyof SupabaseInviteRow];

  if (filter.op === "eq") {
    return value === filter.value;
  }

  if (filter.op === "is") {
    return value === filter.value;
  }

  if (filter.op === "not") {
    if (filter.operator === "is") {
      return value !== filter.value;
    }

    return value !== filter.value;
  }

  return (
    typeof value === "string" &&
    typeof filter.value === "string" &&
    value <= filter.value
  );
}

function cloneRow(row: SupabaseInviteRow): SupabaseInviteRow {
  return {
    ...row,
    counter_offer: row.counter_offer ? { ...row.counter_offer } : null,
    date_details: row.date_details ? { ...row.date_details } : null,
    place_details: row.place_details ? { ...row.place_details } : null
  };
}
