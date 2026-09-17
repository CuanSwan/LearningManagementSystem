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
