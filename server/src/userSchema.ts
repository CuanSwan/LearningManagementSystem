import { z } from "zod";

export const UserRoleSchema = z.enum(["student", "admin", "super_admin"]);
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
});
export type User = z.infer<typeof UserSchema>;
