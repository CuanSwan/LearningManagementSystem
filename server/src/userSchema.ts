import { z } from "zod";

export const UserRoleSchema = z.enum(["student", "admin", "super_admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Public-safe user shape - never carries a password or password hash.
export const UserSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
});
export type User = z.infer<typeof UserSchema>;

const ROLE_RANK: Record<UserRole, number> = {
  student: 0,
  admin: 1,
  super_admin: 2,
};

export function hasAtLeastRole(role: UserRole, minimum: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
