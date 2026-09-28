import { z } from "zod";

export const UserRoleSchema = z.enum(["student", "reviewer", "admin", "super_admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// "password" is every normal account (register, admin-created) - it has a
// real password and can log in through the login form. "embed" is an
// account auto-provisioned from an embed link (see server/src/index.ts's
// /api/embed) - it has no usable password and only ever exists to hold
// course assignments and progress for a visitor coming from an embedded
// iframe. Defaults to "password" so every account created before this
// field existed still parses as the (correct) normal case.
export const AuthOriginSchema = z.enum(["password", "embed"]);
export type AuthOrigin = z.infer<typeof AuthOriginSchema>;
// Applied everywhere a password is being SET (register, self-service
// change, admin reset) - never for login, which has to keep accepting
// whatever password an existing account was created with, complexity
// rules or not. Zod reports every failing rule at once (via
// sendValidationError's issue-joining), not just the first, so a weak
// password gets one message listing everything still missing.
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

// Public-safe user shape - never carries a password or password hash.
// assignedLearningPathIds/assignedCourseIds default to [] so existing
// stored users (from before this field existed) still parse - an admin
// hasn't assigned them anything yet, which is exactly what an empty array
// means.
export const UserSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  assignedLearningPathIds: z.array(z.string()).default([]),
  assignedCourseIds: z.array(z.string()).default([]),
  authOrigin: AuthOriginSchema.default("password"),
  // Absent for a user with no originating voucher (every account created
  // before this feature existed, plus the seeded demo accounts) - such a
  // user never expires. Present for a voucher-registered user: memberSince
  // is the voucher's issuedAt, membershipExpiresAt is the point login stops
  // working unless an admin issues a new voucher.
  memberSince: z.number().optional(),
  membershipExpiresAt: z.number().optional(),
  // Only meaningful for role "reviewer" - the one course category this
  // reviewer handles, matched against a course's own category when a
  // course is submitted for review (see store.ts's assignRandomReviewer).
  reviewerCategory: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;
