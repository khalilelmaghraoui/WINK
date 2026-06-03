import { randomUUID } from "node:crypto";

import { generateSlug } from "./generate-slug";

export type InviteTone =
  | "romantic"
  | "playful"
  | "apologetic"
  | "surprise"
  | "custom";

export type InviteMode = "lawyer" | "unbothered";

export type DateType = "date" | "apology" | "surprise" | "romantic_moment";

export type InviteStatus =
  | "draft"
  | "pending"
  | "opened"
  | "accepted"
  | "raincheck"
  | "declined";

export type InvitePhase = "compose" | "sent" | "opened" | "responded" | "closed";

export type InviteResponse = "yes" | "raincheck" | "no";

export interface CounterOffer {
  message?: string;
  proposedDateIso?: string;
  proposedPlace?: string;
}

export interface Invite {
  id: string;
  slug: string;
  mode: InviteMode;
  tone: InviteTone;
  dateType: DateType;
  status: InviteStatus;
  phase: InvitePhase;
  recipientName: string;
  message: string;
  dateDetails: {
    title?: string;
    startsAt?: string;
    notes?: string;
  };
  placeDetails: {
    name?: string;
    address?: string;
    notes?: string;
  };
  response: InviteResponse | null;
  counterOffer: CounterOffer | null;
  openedAt: string | null;
  respondedAt: string | null;
  unknownSenderFlaggedAt: string | null;
  canceledAt: string | null;
  expiresAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInviteInput {
  recipientName: string;
  message: string;
  mode: InviteMode;
  tone?: InviteTone;
  dateType?: DateType;
  dateDetails?: Invite["dateDetails"];
  placeDetails?: Invite["placeDetails"];
  expiresAt?: string | null;
}

export interface InviteReadOptions {
  previewMode?: boolean;
}

export interface InviteWriteOptions {
  previewMode?: boolean;
}

export interface InviteResponsePayload extends InviteWriteOptions {
  response: InviteResponse;
  counterOffer?: CounterOffer | null;
}

export interface InviteStore {
  createInvite(input: CreateInviteInput): Promise<Invite>;
  getInviteBySlug(
    slug: string,
    opts?: InviteReadOptions
  ): Promise<Invite | null>;
  markOpened(slug: string, opts?: InviteWriteOptions): Promise<Invite | null>;
  respond(slug: string, payload: InviteResponsePayload): Promise<Invite | null>;
  flagUnknownSender(
    slug: string,
    opts?: InviteWriteOptions
  ): Promise<Invite | null>;
  cancelInvite(slug: string, opts?: InviteWriteOptions): Promise<Invite | null>;
  expireInvites(
    nowIso: string,
    opts?: InviteWriteOptions
  ): Promise<Invite[]>;
}

interface InMemoryInviteStoreOptions {
  slugLength?: number;
  slugGenerator?: (length?: number) => string;
  now?: () => string;
}

const responseStatus: Record<InviteResponse, InviteStatus> = {
  yes: "accepted",
  raincheck: "raincheck",
  no: "declined"
};

export class InMemoryInviteStore implements InviteStore {
  private invitesBySlug = new Map<string, Invite>();
  private readonly slugLength: number;
  private readonly slugGenerator: (length?: number) => string;
  private readonly now: () => string;

  constructor(options: InMemoryInviteStoreOptions = {}) {
    this.slugLength = options.slugLength ?? 10;
    this.slugGenerator = options.slugGenerator ?? generateSlug;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async createInvite(input: CreateInviteInput): Promise<Invite> {
    const nowIso = this.now();
    const invite: Invite = {
      id: randomUUID(),
      slug: this.createUniqueSlug(),
      mode: input.mode,
      tone: input.tone ?? "custom",
      dateType: input.dateType ?? "date",
      status: "pending",
      phase: "sent",
      recipientName: input.recipientName,
      message: input.message,
      dateDetails: input.dateDetails ?? {},
      placeDetails: input.placeDetails ?? {},
      response: null,
      counterOffer: null,
      openedAt: null,
      respondedAt: null,
      unknownSenderFlaggedAt: null,
      canceledAt: null,
      expiresAt: input.expiresAt ?? null,
      expiredAt: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.invitesBySlug.set(invite.slug, invite);

    return cloneInvite(invite);
  }

  async getInviteBySlug(
    slug: string,
    _opts: InviteReadOptions = {}
  ): Promise<Invite | null> {
    const invite = this.invitesBySlug.get(slug);

    return invite ? cloneInvite(invite) : null;
  }

  async markOpened(
    slug: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite | null> {
    const invite = this.invitesBySlug.get(slug);

    if (!invite) {
      return null;
    }

    if (opts.previewMode || invite.openedAt) {
      return cloneInvite(invite);
    }

    const nowIso = this.now();
    const nextInvite: Invite = {
      ...invite,
      status: invite.status === "pending" ? "opened" : invite.status,
      phase: invite.phase === "sent" ? "opened" : invite.phase,
      openedAt: nowIso,
      updatedAt: nowIso
    };

    this.invitesBySlug.set(slug, nextInvite);

    return cloneInvite(nextInvite);
  }

  async respond(
    slug: string,
    payload: InviteResponsePayload
  ): Promise<Invite | null> {
    const invite = this.invitesBySlug.get(slug);

    if (!invite) {
      return null;
    }

    const nextInvite = this.applyResponse(invite, payload);

    if (!payload.previewMode) {
      this.invitesBySlug.set(slug, nextInvite);
    }

    return cloneInvite(nextInvite);
  }

  async flagUnknownSender(
    slug: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite | null> {
    const invite = this.invitesBySlug.get(slug);

    if (!invite) {
      return null;
    }

    const nowIso = this.now();
    const nextInvite: Invite = {
      ...invite,
      phase: "closed",
      unknownSenderFlaggedAt: nowIso,
      updatedAt: nowIso
    };

    if (!opts.previewMode) {
      this.invitesBySlug.set(slug, nextInvite);
    }

    return cloneInvite(opts.previewMode ? invite : nextInvite);
  }

  async cancelInvite(
    slug: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite | null> {
    const invite = this.invitesBySlug.get(slug);

    if (!invite) {
      return null;
    }

    const nowIso = this.now();
    const nextInvite: Invite = {
      ...invite,
      phase: "closed",
      canceledAt: nowIso,
      updatedAt: nowIso
    };

    if (!opts.previewMode) {
      this.invitesBySlug.set(slug, nextInvite);
    }

    return cloneInvite(opts.previewMode ? invite : nextInvite);
  }

  async expireInvites(
    nowIso: string,
    opts: InviteWriteOptions = {}
  ): Promise<Invite[]> {
    const expiredInvites: Invite[] = [];

    for (const invite of Array.from(this.invitesBySlug.values())) {
      if (!shouldExpire(invite, nowIso)) {
        continue;
      }

      const nextInvite: Invite = {
        ...invite,
        phase: "closed",
        expiredAt: nowIso,
        updatedAt: nowIso
      };

      expiredInvites.push(cloneInvite(nextInvite));

      if (!opts.previewMode) {
        this.invitesBySlug.set(invite.slug, nextInvite);
      }
    }

    return expiredInvites;
  }

  private createUniqueSlug(): string {
    let slug = this.slugGenerator(this.slugLength);

    while (this.invitesBySlug.has(slug)) {
      slug = this.slugGenerator(this.slugLength);
    }

    return slug;
  }

  private applyResponse(
    invite: Invite,
    payload: InviteResponsePayload
  ): Invite {
    const nowIso = this.now();

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

export const inviteStore: InviteStore = new InMemoryInviteStore();
