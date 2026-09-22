import { z } from "zod";

export const UserRoleSchema = z.enum(["student", "admin", "super_admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

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
  // Absent for a user with no originating voucher (every account created
  // before this feature existed, plus the seeded demo accounts) - such a
  // user never expires. Present for a voucher-registered user: memberSince
  // is the voucher's issuedAt, membershipExpiresAt is the point login stops
  // working unless an admin issues a new voucher.
  memberSince: z.number().optional(),
  membershipExpiresAt: z.number().optional(),
});
export type User = z.infer<typeof UserSchema>;
