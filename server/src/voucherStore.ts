import type { Database, DocumentStore } from "./db/index.js";
import { VOUCHER_VALIDITY_MS, VoucherSchema, type PublicVoucher, type Voucher, type VoucherStatus } from "./voucherSchema.js";
import type { UserRole } from "./userSchema.js";

let vouchers: DocumentStore<Voucher>;

export async function initVoucherStore(db: Database): Promise<void> {
  // Not unique - a revoked or expired voucher for an email can legitimately
  // be followed by a fresh one for the same address, so this index is only
  // for lookup speed (e.g. "does this email already have a pending
  // voucher"), not a uniqueness guarantee.
  vouchers = await db.createStore<Voucher>("vouchers", "voucherId", [{ fields: { email: 1 } }]);
}

export async function createVoucher(input: { email: string; name: string; role: UserRole }): Promise<Voucher> {
  const issuedAt = Date.now();
  const voucher = VoucherSchema.parse({
    voucherId: crypto.randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    issuedAt,
    // Only a student's access is meant to lapse on a clock - an admin or
    // super_admin voucher (and the account it becomes) never expires.
    expiresAt: input.role === "student" ? issuedAt + VOUCHER_VALIDITY_MS : undefined,
    status: "pending" satisfies VoucherStatus,
  });
  await vouchers.set(voucher.voucherId, voucher);
  return voucher;
}

export async function getVoucher(voucherId: string): Promise<Voucher | undefined> {
  return (await vouchers.get(voucherId)) ?? undefined;
}

export async function listVouchers(): Promise<Voucher[]> {
  return vouchers.list();
}

export function isVoucherExpired(voucher: Pick<Voucher, "expiresAt">): boolean {
  return voucher.expiresAt !== undefined && Date.now() > voucher.expiresAt;
}

// Only a still-pending voucher can be revoked - one already consumed has a
// real user behind it now (revoking it wouldn't undo the account, just
// desync the audit trail), and revoking an already-revoked one is a no-op
// the caller doesn't need a special case for.
export async function revokeVoucher(voucherId: string): Promise<Voucher | undefined> {
  const existing = await getVoucher(voucherId);
  if (!existing || existing.status !== "pending") return undefined;
  const updated = await vouchers.update(voucherId, { status: "revoked" });
  return updated ?? undefined;
}

export async function markVoucherRegistered(voucherId: string, userId: string): Promise<Voucher | undefined> {
  const updated = await vouchers.update(voucherId, {
    status: "registered",
    registeredUserId: userId,
    registeredAt: Date.now(),
  });
  return updated ?? undefined;
}

export type VoucherRegistrationProblem = "revoked" | "already_used" | "expired" | "email_mismatch";

export const VOUCHER_REGISTRATION_ERROR_MESSAGES: Record<VoucherRegistrationProblem, string> = {
  revoked: "This invitation has been revoked.",
  already_used: "This invitation has already been used.",
  expired: "This invitation has expired. Ask an admin to issue a new one.",
  email_mismatch: "This invitation was issued to a different email address.",
};

// Pure and synchronous given a voucher already fetched by the caller - kept
// separate from the register route itself (which does the fetch and the
// actual user creation) so this security-relevant decision is testable
// without a DB or an HTTP request.
export function checkVoucherForRegistration(voucher: Voucher, email: string): VoucherRegistrationProblem | null {
  if (voucher.status === "revoked") return "revoked";
  if (voucher.status === "registered") return "already_used";
  if (isVoucherExpired(voucher)) return "expired";
  // The whole point of tying a voucher to a specific email - a link
  // intercepted or forwarded to anyone else can't be used to register.
  if (voucher.email !== email.toLowerCase()) return "email_mismatch";
  return null;
}

export function toPublicVoucher(voucher: Voucher): PublicVoucher {
  return {
    voucherId: voucher.voucherId,
    email: voucher.email,
    name: voucher.name,
    role: voucher.role,
    expiresAt: voucher.expiresAt,
    status: voucher.status,
  };
}
