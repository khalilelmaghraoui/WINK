export const recipientMessageMaxLength = 300;

export type RecipientMessageValidationResult =
  | {
      message: string;
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

export function validateRecipientMessage(
  value: FormDataEntryValue | string | null
): RecipientMessageValidationResult {
  if (typeof value !== "string") {
    return {
      error: "Write a message before sending.",
      ok: false
    };
  }

  const normalized = normalizeRecipientMessage(value);

  if (!normalized) {
    return {
      error: "Write a message before sending.",
      ok: false
    };
  }

  if (normalized.length > recipientMessageMaxLength) {
    return {
      error: `Keep it to ${recipientMessageMaxLength} characters or fewer.`,
      ok: false
    };
  }

  return {
    message: normalized,
    ok: true
  };
}

export function normalizeRecipientMessage(value: string): string {
  return value.replace(/\0/g, "").replace(/\r\n?/g, "\n").trim();
}
