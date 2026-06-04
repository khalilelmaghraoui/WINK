import { randomUUID } from "node:crypto";

import { generateSlug } from "../generate-slug";
import type {
  CounterOffer,
  CreateInviteInput,
  DateType,
  Invite,
  InviteMode,
  InvitePhase,
  InviteReadOptions,
  InviteResponse,
  InviteResponsePayload,
  InviteStatus,
  InviteStore,
  InviteTone,
  InviteWriteOptions
} from "../invite-store";
import { createSupabaseServerClient } from "../supabase/server";

const responseStatus: Record<InviteResponse, InviteStatus> = {
  yes: "accepted",
  raincheck: "raincheck",
  no: "declined"
};

export interface SupabaseInviteRow {
  id: string;
  share_slug: string;
  mode: InviteMode;
  tone: InviteTone;
  date_type: DateType;
  status: InviteStatus;
  phase: InvitePhase;
  sender_name: string;
  recipient_name: string;
  message: string;
  date_details: Invite["dateDetails"] | null;
  place_details: Invite["placeDetails"] | null;
  response: InviteResponse | null;
  counter_offer: CounterOffer | null;
  no_tap_count: number | null;
  opened_at: string | null;
  responded_at: string | null;
  unknown_sender_flagged_at: string | null;
  canceled_at: string | null;
  expires_at: string | null;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SupabaseError {
  code?: string;
  message: string;
}

interface SupabaseSingleResult<T> {
  data: T | null;
  error: SupabaseError | null;
}

interface SupabaseListResult<T> {
  data: T[] | null;
  error: SupabaseError | null;
}

interface SupabaseSingleQuery<T> {
  eq(column: string, value: unknown): SupabaseSingleQuery<T>;
  is(column: string, value: unknown): SupabaseSingleQuery<T>;
  maybeSingle(): Promise<SupabaseSingleResult<T>>;
  single(): Promise<SupabaseSingleResult<T>>;
}

interface SupabaseListQuery<T> {
  eq(column: string, value: unknown): SupabaseSelectQuery<T>;
  is(column: string, value: unknown): SupabaseSelectQuery<T>;
  lte(column: string, value: unknown): SupabaseSelectQuery<T>;
  select(columns?: string): SupabaseSelectQuery<T>;
  then<TResult1 = SupabaseListResult<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseListResult<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2>;
}

type SupabaseSelectQuery<T> = SupabaseListQuery<T> & SupabaseSingleQuery<T>;

interface SupabaseMutationQuery<T> {
  eq(column: string, value: unknown): SupabaseMutationQuery<T>;
  is(column: string, value: unknown): SupabaseMutationQuery<T>;
  select(columns?: string): SupabaseSingleQuery<T>;
}

interface SupabaseInviteTable<T> {
  insert(values: T): {
    select(columns?: string): SupabaseSingleQuery<T>;
  };
  select(columns?: string): SupabaseSelectQuery<T>;
  update(values: Partial<T>): SupabaseMutationQuery<T>;
}

export interface SupabaseInviteClient {
  from(table: "invites"): SupabaseInviteTable<SupabaseInviteRow>;
}

export interface SupabaseInviteStoreOptions {
  client?: SupabaseInviteClient;
  env?: Partial<NodeJS.ProcessEnv>;
  now?: () => string;
  slugGenerator?: (length?: number) => string;
  slugLength?: number;
}

export class SupabaseInviteStore implements InviteStore {
  private readonly client: SupabaseInviteClient;
  private readonly now: () => string;
  private readonly slugGenerator: (length?: number) => string;
  private readonly slugLength: number;

  constructor(options: SupabaseInviteStoreOptions = {}) {
    this.client =
      options.client ??
      (createSupabaseServerClient(
        options.env
      ) as unknown as SupabaseInviteClient);
    this.now = options.now ?? (() => new Date().toISOString());
    this.slugGenerator = options.slugGenerator ?? generateSlug;
    this.slugLength = options.slugLength ?? 10;
  }

  async createInvite(input: CreateInviteInput): Promise<Invite> {
    const nowIso = this.now();
    const invite: Invite = {
      id: randomUUID(),
      slug: await this.createUniqueSlug(),
      mode: input.mode,
      tone: input.tone ?? "romantic",
      dateType: input.dateType ?? "date",
      status: "pending",
      phase: "sent",
      senderName: input.senderName ?? "",
      recipientName: input.recipientName,
      message: input.message,
      dateDetails: input.dateDetails ?? {},
      placeDetails: input.placeDetails ?? {},
      response: null,
      counterOffer: null,
      noTapCount: 0,
      openedAt: null,
      respondedAt: null,
      unknownSenderFlaggedAt: null,
      canceledAt: null,
      expiresAt: input.expiresAt ?? null,
      expiredAt: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const { data, error } = await this.table()
      .insert(inviteToSupabaseRow(invite))
      .select("*")
      .single();

    throwIfSupabaseError(error, "create invite");

    return inviteFromSupabaseRow(data);
  }

  async getInviteBySlug(
    slug: string,
    _opts: InviteReadOptions = {}
  ): Promise<Invite | null> {
    const row = await this.getRowBySlug(slug);

    return row ? inviteFromSupabaseRow(row) : null;
  }

  async markOpened(
    slug: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite | null> {
    const invite = await this.getInviteBySlug(slug);

    if (!invite || opts.previewMode || invite.openedAt) {
      return invite;
    }

    const nowIso = this.now();
    const { data, error } = await this.table()
      .update({
        opened_at: nowIso,
        phase: invite.phase === "sent" ? "opened" : invite.phase,
        status: invite.status === "pending" ? "opened" : invite.status,
        updated_at: nowIso
      })
      .eq("share_slug", slug)
      .is("opened_at", null)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error, "mark invite opened");

    if (!data) {
      return this.getInviteBySlug(slug);
    }

    return inviteFromSupabaseRow(data);
  }

  async respond(
    slug: string,
    payload: InviteResponsePayload
  ): Promise<Invite | null> {
    const invite = await this.getInviteBySlug(slug);

    if (!invite) {
      return null;
    }

    const nextInvite = applyResponse(invite, payload, this.now());

    if (payload.previewMode) {
      return cloneInvite(nextInvite);
    }

    return this.updateInvite(slug, {
      counter_offer: nextInvite.counterOffer,
      phase: nextInvite.phase,
      responded_at: nextInvite.respondedAt,
      response: nextInvite.response,
      status: nextInvite.status,
      updated_at: nextInvite.updatedAt
    });
  }

  async recordNoTap(
    slug: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite | null> {
    const invite = await this.getInviteBySlug(slug);

    if (!invite) {
      return null;
    }

    if (opts.previewMode) {
      return invite;
    }

    const nowIso = this.now();

    return this.updateInvite(slug, {
      no_tap_count: capNoTapCount(invite.noTapCount + 1),
      updated_at: nowIso
    });
  }

  async flagUnknownSender(
    slug: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite | null> {
    const invite = await this.getInviteBySlug(slug);

    if (!invite) {
      return null;
    }

    if (opts.previewMode) {
      return invite;
    }

    const nowIso = this.now();

    return this.updateInvite(slug, {
      phase: "closed",
      status: "flagged",
      unknown_sender_flagged_at: nowIso,
      updated_at: nowIso
    });
  }

  async cancelInvite(
    slug: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite | null> {
    const invite = await this.getInviteBySlug(slug);

    if (!invite) {
      return null;
    }

    if (opts.previewMode) {
      return invite;
    }

    const nowIso = this.now();

    return this.updateInvite(slug, {
      canceled_at: nowIso,
      phase: "closed",
      status: "cancelled",
      updated_at: nowIso
    });
  }

  async expireInvites(
    nowIso: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite[]> {
    const { data, error } = await this.table()
      .select("*")
      .lte("expires_at", nowIso)
      .is("expired_at", null)
      .is("canceled_at", null)
      .is("response", null);

    throwIfSupabaseError(error, "load expiring invites");

    const expiringRows = data ?? [];
    const expiredInvites: Invite[] = [];

    for (const row of expiringRows) {
      const invite = inviteFromSupabaseRow(row);

      if (!shouldExpire(invite, nowIso)) {
        continue;
      }

      const nextInvite = {
        ...invite,
        expiredAt: nowIso,
        phase: "closed" as const,
        status: "expired" as const,
        updatedAt: nowIso
      };

      expiredInvites.push(cloneInvite(nextInvite));

      if (!opts.previewMode) {
        await this.updateInvite(invite.slug, {
          expired_at: nowIso,
          phase: "closed",
          status: "expired",
          updated_at: nowIso
        });
      }
    }

    return expiredInvites;
  }

  private async createUniqueSlug(): Promise<string> {
    let slug = this.slugGenerator(this.slugLength);
    let existingInvite = await this.getInviteBySlug(slug);

    while (existingInvite) {
      slug = this.slugGenerator(this.slugLength);
      existingInvite = await this.getInviteBySlug(slug);
    }

    return slug;
  }

  private async getRowBySlug(slug: string): Promise<SupabaseInviteRow | null> {
    const { data, error } = await this.table()
      .select("*")
      .eq("share_slug", slug)
      .maybeSingle();

    throwIfSupabaseError(error, "load invite");

    return data;
  }

  private table(): SupabaseInviteTable<SupabaseInviteRow> {
    return this.client.from("invites");
  }

  private async updateInvite(
    slug: string,
    values: Partial<SupabaseInviteRow>
  ): Promise<Invite | null> {
    const { data, error } = await this.table()
      .update(values)
      .eq("share_slug", slug)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error, "update invite");

    return data ? inviteFromSupabaseRow(data) : null;
  }
}

export function inviteToSupabaseRow(invite: Invite): SupabaseInviteRow {
  return {
    id: invite.id,
    share_slug: invite.slug,
    mode: invite.mode,
    tone: invite.tone,
    date_type: invite.dateType,
    status: invite.status,
    phase: invite.phase,
    sender_name: invite.senderName,
    recipient_name: invite.recipientName,
    message: invite.message,
    date_details: { ...invite.dateDetails },
    place_details: { ...invite.placeDetails },
    response: invite.response,
    counter_offer: invite.counterOffer ? { ...invite.counterOffer } : null,
    no_tap_count: invite.noTapCount,
    opened_at: invite.openedAt,
    responded_at: invite.respondedAt,
    unknown_sender_flagged_at: invite.unknownSenderFlaggedAt,
    canceled_at: invite.canceledAt,
    expires_at: invite.expiresAt,
    expired_at: invite.expiredAt,
    created_at: invite.createdAt,
    updated_at: invite.updatedAt
  };
}

export function inviteFromSupabaseRow(row: SupabaseInviteRow | null): Invite {
  if (!row) {
    throw new Error("Supabase returned no invite row.");
  }

  return {
    id: row.id,
    slug: row.share_slug,
    mode: row.mode,
    tone: row.tone,
    dateType: row.date_type,
    status: row.status,
    phase: row.phase,
    senderName: row.sender_name,
    recipientName: row.recipient_name,
    message: row.message,
    dateDetails: row.date_details ?? {},
    placeDetails: row.place_details ?? {},
    response: row.response,
    counterOffer: row.counter_offer ? { ...row.counter_offer } : null,
    noTapCount: capNoTapCount(row.no_tap_count ?? 0),
    openedAt: row.opened_at,
    respondedAt: row.responded_at,
    unknownSenderFlaggedAt: row.unknown_sender_flagged_at,
    canceledAt: row.canceled_at,
    expiresAt: row.expires_at,
    expiredAt: row.expired_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function applyResponse(
  invite: Invite,
  payload: InviteResponsePayload,
  nowIso: string
): Invite {
  return {
    ...invite,
    status: responseStatus[payload.response],
    phase: "responded",
    response: payload.response,
    counterOffer: payload.counterOffer ?? null,
    respondedAt: nowIso,
    updatedAt: nowIso
  };
}

function shouldExpire(invite: Invite, nowIso: string): boolean {
  return (
    invite.expiresAt !== null &&
    invite.expiredAt === null &&
    invite.canceledAt === null &&
    invite.response === null &&
    invite.expiresAt <= nowIso
  );
}

function cloneInvite(invite: Invite): Invite {
  return {
    ...invite,
    dateDetails: { ...invite.dateDetails },
    placeDetails: { ...invite.placeDetails },
    counterOffer: invite.counterOffer ? { ...invite.counterOffer } : null
  };
}

function capNoTapCount(value: number): 0 | 1 | 2 {
  if (value <= 0) {
    return 0;
  }

  if (value === 1) {
    return 1;
  }

  return 2;
}

function throwIfSupabaseError(
  error: SupabaseError | null,
  operation: string
): void {
  if (error) {
    throw new Error(`Could not ${operation}: ${error.message}`);
  }
}
