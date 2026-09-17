import { hashPassword, verifyPassword } from "./auth.js";
import type { Database, DocumentStore } from "./db/index.js";
import { UserSchema, type User, type UserRole } from "./userSchema.js";

interface StoredUser extends Record<string, unknown> {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}

let users: DocumentStore<StoredUser>;

export function initUserStore(db: Database): void {
  users = db.createStore<StoredUser>("users", "userId");
}

function toPublicUser(stored: StoredUser): User {
  return UserSchema.parse({
    userId: stored.userId,
    email: stored.email,
    name: stored.name,
    role: stored.role,
  });
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}): Promise<User> {
  const email = input.email.toLowerCase();
  const existing = await users.list({ email });
  if (existing.length > 0) {
    throw new Error("A user with that email already exists");
  }
  const stored: StoredUser = {
    userId: crypto.randomUUID(),
    email,
    name: input.name,
    role: input.role,
    passwordHash: hashPassword(input.password),
  };
  await users.set(stored.userId, stored);
  return toPublicUser(stored);
}

export async function verifyCredentials(email: string, password: string): Promise<User | undefined> {
  const matches = await users.list({ email: email.toLowerCase() });
  const stored = matches[0];
  if (!stored || !verifyPassword(password, stored.passwordHash)) return undefined;
  return toPublicUser(stored);
}

export async function getUserById(userId: string): Promise<User | undefined> {
  const stored = await users.get(userId);
  return stored ? toPublicUser(stored) : undefined;
}

export async function listUsers(): Promise<User[]> {
  return (await users.list()).map(toPublicUser);
}

export async function setUserRole(userId: string, role: UserRole): Promise<User | undefined> {
  const updated = await users.update(userId, { role });
  return updated ? toPublicUser(updated) : undefined;
}

// For a user changing their own password - verifies the password they
// currently know before letting the change through.
export async function verifyCurrentPassword(userId: string, password: string): Promise<boolean> {
  const stored = await users.get(userId);
  return stored ? verifyPassword(password, stored.passwordHash) : false;
}

// For both self-service changes (after verifyCurrentPassword above) and a
// super_admin's password reset for another user (no current-password check).
export async function updatePassword(userId: string, newPassword: string): Promise<boolean> {
  const updated = await users.update(userId, { passwordHash: hashPassword(newPassword) });
  return updated !== null;
}

export async function userExistsByEmail(email: string): Promise<boolean> {
  const matches = await users.list({ email: email.toLowerCase() });
  return matches.length > 0;
}
