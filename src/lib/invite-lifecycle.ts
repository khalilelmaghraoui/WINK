import type { Invite, InviteStatus } from "./invite-store";

const expirableStatuses = new Set<InviteStatus>(["pending", "opened"]);

export function isInviteExpired(invite: Invite, now: Date): boolean {
  return getEffectiveInviteStatus(invite, now) === "expired";
}

export function getEffectiveInviteStatus(
  invite: Invite,
  now: Date
): InviteStatus {
  if (!expirableStatuses.has(invite.status)) {
    return invite.status;
  }

  if (!invite.expiresAt) {
    return invite.status;
  }

  const expiresAtMs = parseExpiryInstant(invite.expiresAt);
  const nowMs = now.getTime();

  if (expiresAtMs === null || !Number.isFinite(nowMs)) {
    return invite.status;
  }

  return nowMs >= expiresAtMs ? "expired" : invite.status;
}

export function getEffectiveInvite(invite: Invite, now: Date): Invite {
  if (!isInviteExpired(invite, now)) {
    return cloneInvite(invite);
  }

  const nowIso = now.toISOString();

  return {
    ...cloneInvite(invite),
    status: "expired",
    phase: "closed",
    expiredAt: invite.expiredAt ?? nowIso,
    updatedAt: nowIso
  };
}

export function shouldPersistInviteExpiry(
  invite: Invite,
  nowIso: string
): boolean {
  return isInviteExpired(invite, new Date(nowIso)) && invite.expiredAt === null;
}

function cloneInvite(invite: Invite): Invite {
  return {
    ...invite,
    dateDetails: { ...invite.dateDetails },
    placeDetails: { ...invite.placeDetails },
    counterOffer: invite.counterOffer ? { ...invite.counterOffer } : null
  };
}

function parseExpiryInstant(value: string): number | null {
  const trimmed = value.trim();
  const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T/);

  if (!dateMatch) {
    return null;
  }

  const [, yearText, monthText, dayText] = dateMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null;
  }

  const timestamp = Date.parse(trimmed);

  return Number.isFinite(timestamp) ? timestamp : null;
}
