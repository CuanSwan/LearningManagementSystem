import type { Database, DocumentStore } from "./db/index.js";
import { PasswordResetSchema, type PasswordReset } from "./schemas.js";

let resets: DocumentStore<PasswordReset>;

// How long an emailed reset link stays usable. Short enough that a stale,
// forwarded, or inbox-leaked link is a narrow window of exposure, long
// enough that someone doesn't have to race their own email provider.
export const PASSWORD_RESET_VALIDITY_MS = 60 * 60 * 1000;

export async function initPasswordResetStore(db: Database): Promise<void> {
  // Not unique - a user can legitimately request several reset links (e.g.
  // after not finding the first email), so this index is only for lookup
  // speed, not a uniqueness guarantee.
  resets = await db.createStore<PasswordReset>("passwordResets", "tokenId", [{ fields: { userId: 1 } }]);
}

export async function createPasswordReset(input: { userId: string; email: string }): Promise<PasswordReset> {
  const issuedAt = Date.now();
  const reset = PasswordResetSchema.parse({
    tokenId: crypto.randomUUID(),
    userId: input.userId,
    email: input.email.toLowerCase(),
    issuedAt,
    expiresAt: issuedAt + PASSWORD_RESET_VALIDITY_MS,
  });
  await resets.set(reset.tokenId, reset);
  return reset;
}

export async function getPasswordReset(tokenId: string): Promise<PasswordReset | undefined> {
  return (await resets.get(tokenId)) ?? undefined;
}

export async function markPasswordResetUsed(tokenId: string): Promise<void> {
  await resets.update(tokenId, { usedAt: Date.now() });
}

export type PasswordResetProblem = "used" | "expired";

export const PASSWORD_RESET_ERROR_MESSAGES: Record<PasswordResetProblem, string> = {
  used: "This reset link has already been used.",
  expired: "This reset link has expired. Request a new one.",
};

// Pure and synchronous given a reset record already fetched by the caller -
// kept separate from the route itself so this security-relevant decision is
// testable without a DB or an HTTP request.
export function checkPasswordResetToken(reset: PasswordReset): PasswordResetProblem | null {
  if (reset.usedAt !== undefined) return "used";
  if (Date.now() > reset.expiresAt) return "expired";
  return null;
}
