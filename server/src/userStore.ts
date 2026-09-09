import { UserSchema, type User, type UserRole } from "@lms/shared";
import { hashPassword, verifyPassword } from "./auth.js";

interface StoredUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}

const usersById = new Map<string, StoredUser>();
const idByEmail = new Map<string, string>();

function toPublicUser(stored: StoredUser): User {
  return UserSchema.parse({
    userId: stored.userId,
    email: stored.email,
    name: stored.name,
    role: stored.role,
  });
}

export function createUser(input: { email: string; name: string; password: string; role: UserRole }): User {
  const email = input.email.toLowerCase();
  if (idByEmail.has(email)) {
    throw new Error("A user with that email already exists");
  }
  const stored: StoredUser = {
    userId: crypto.randomUUID(),
    email,
    name: input.name,
    role: input.role,
    passwordHash: hashPassword(input.password),
  };
  usersById.set(stored.userId, stored);
  idByEmail.set(email, stored.userId);
  return toPublicUser(stored);
}

export function verifyCredentials(email: string, password: string): User | undefined {
  const id = idByEmail.get(email.toLowerCase());
  const stored = id ? usersById.get(id) : undefined;
  if (!stored || !verifyPassword(password, stored.passwordHash)) return undefined;
  return toPublicUser(stored);
}

export function getUserById(userId: string): User | undefined {
  const stored = usersById.get(userId);
  return stored ? toPublicUser(stored) : undefined;
}

export function listUsers(): User[] {
  return [...usersById.values()].map(toPublicUser);
}

export function setUserRole(userId: string, role: UserRole): User | undefined {
  const stored = usersById.get(userId);
  if (!stored) return undefined;
  stored.role = role;
  return toPublicUser(stored);
}
