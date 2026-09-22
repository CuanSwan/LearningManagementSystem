import { z } from "zod";
import { UserRoleSchema } from "./userSchema.js";

export const VoucherStatusSchema = z.enum(["pending", "registered", "revoked"]);
export type VoucherStatus = z.infer<typeof VoucherStatusSchema>;

// The one year a voucher (and, transitively, the account created from it)
// stays valid for. Not configurable per-voucher - every voucher gets the
// same window, measured from the moment an admin issues it.
export const VOUCHER_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;

// A voucher is not a user - it's an admin's intent to let exactly one email
// address register as a specific name/role, for one year from issuance.
// voucherId doubles as the unguessable secret embedded in the sign-up link
// (it's a crypto.randomUUID(), same as every other id in this app), so
// there's no separate "code" field to keep in sync with it.
export const VoucherSchema = z.object({
  voucherId: z.string(),
  email: z.string().email(),
  // The name the admin entered when issuing the voucher - becomes the
  // registered user's name. Registration doesn't collect a name of its
  // own; the voucher is the only place it's set.
  name: z.string().min(1),
  // Held on the voucher, not decided at registration - stops a client from
  // self-elevating by passing its own `role` in the register request.
  role: UserRoleSchema,
  issuedAt: z.number(),
  expiresAt: z.number(),
  status: VoucherStatusSchema,
  // Set once the voucher is consumed - kept around (rather than deleting
  // the voucher) both as an audit trail and because the resulting user
  // record links back to this voucher for its own membership-expiry check.
  registeredUserId: z.string().optional(),
  registeredAt: z.number().optional(),
});
export type Voucher = z.infer<typeof VoucherSchema>;

export function parseVoucher(data: unknown): Voucher {
  return VoucherSchema.parse(data);
}

// What the public, unauthenticated GET /api/vouchers/:voucherId (used by
// the register page to greet the invitee and catch an already-used/expired
// voucher before they fill out the form) is allowed to return - notably
// never registeredUserId, which would leak another user's id to anyone
// holding the link after it's been used.
export const PublicVoucherSchema = VoucherSchema.pick({
  voucherId: true,
  email: true,
  name: true,
  role: true,
  expiresAt: true,
  status: true,
});
export type PublicVoucher = z.infer<typeof PublicVoucherSchema>;
