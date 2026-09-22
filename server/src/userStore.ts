import { hashPassword, verifyPassword } from "./auth.js";
import type { Database, DocumentStore } from "./db/index.js";
import { UserSchema, type User, type UserRole } from "./userSchema.js";
import { getVoucher } from "./voucherStore.js";

interface StoredUser extends Record<string, unknown> {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  assignedLearningPathIds?: string[];
  assignedCourseIds?: string[];
  // Absent for a user created before vouchers existed (or the seeded demo
  // accounts, which skip vouchers entirely) - see UserSchema's
  // memberSince/membershipExpiresAt for what this drives.
  voucherId?: string;
}

let users: DocumentStore<StoredUser>;

export async function initUserStore(db: Database): Promise<void> {
  // Unique because login/registration key off email, not userId - without
  // this, two concurrent registrations for the same address could both pass
  // createUser's own "does this exist" check before either write lands.
  users = await db.createStore<StoredUser>("users", "userId", [{ fields: { email: 1 }, unique: true }]);
}

async function toPublicUser(stored: StoredUser): Promise<User> {
  // A user with no voucherId (pre-voucher accounts, seeded demo accounts)
  // never expires - membership fields simply stay absent for them. A
  // dangling voucherId (the voucher record itself somehow missing) is
  // treated the same way rather than as an error, since the alternative -
  // failing to load the user at all - would be worse than just not
  // showing membership info for them.
  const voucher = stored.voucherId ? await getVoucher(stored.voucherId) : undefined;
  return UserSchema.parse({
    userId: stored.userId,
    email: stored.email,
    name: stored.name,
    role: stored.role,
    assignedLearningPathIds: stored.assignedLearningPathIds ?? [],
    assignedCourseIds: stored.assignedCourseIds ?? [],
    memberSince: voucher?.issuedAt,
    membershipExpiresAt: voucher?.expiresAt,
  });
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  voucherId?: string;
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
    assignedLearningPathIds: [],
    assignedCourseIds: [],
    voucherId: input.voucherId,
  };
  try {
    await users.set(stored.userId, stored);
  } catch (err) {
    // The list() check above has a narrow race window between two
    // concurrent registrations for the same email; the unique index this
    // store is created with (see initUserStore) is what actually closes it,
    // surfacing here as a duplicate-key error instead. Translate it to the
    // same message as the check above so callers see one consistent error
    // either way.
    if ((err as { code?: number }).code === 11000) {
      throw new Error("A user with that email already exists");
    }
    throw err;
  }
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
  return Promise.all((await users.list()).map(toPublicUser));
}

export async function setUserRole(userId: string, role: UserRole): Promise<User | undefined> {
  const updated = await users.update(userId, { role });
  return updated ? toPublicUser(updated) : undefined;
}

export async function setUserAssignments(
  userId: string,
  assignments: { assignedLearningPathIds: string[]; assignedCourseIds: string[] }
): Promise<User | undefined> {
  const updated = await users.update(userId, assignments);
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
