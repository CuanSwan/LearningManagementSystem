import { hashPassword, verifyPassword } from "./auth.js";
import type { Database, DocumentStore } from "./db/index.js";
import { UserSchema, type AuthOrigin, type User, type UserRole } from "./userSchema.js";

interface StoredUser extends Record<string, unknown> {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  assignedLearningPathIds?: string[];
  assignedCourseIds?: string[];
  // Absent for every account created before this field existed - toPublicUser
  // defaults that to "password", the correct reading for all of them.
  authOrigin?: AuthOrigin;
}

let users: DocumentStore<StoredUser>;

export async function initUserStore(db: Database): Promise<void> {
  // Unique because login/registration key off email, not userId - without
  // this, two concurrent registrations for the same address could both pass
  // createUser's own "does this exist" check before either write lands.
  users = await db.createStore<StoredUser>("users", "userId", [{ fields: { email: 1 }, unique: true }]);
}

function toPublicUser(stored: StoredUser): User {
  return UserSchema.parse({
    userId: stored.userId,
    email: stored.email,
    name: stored.name,
    role: stored.role,
    assignedLearningPathIds: stored.assignedLearningPathIds ?? [],
    assignedCourseIds: stored.assignedCourseIds ?? [],
    authOrigin: stored.authOrigin ?? "password",
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
    assignedLearningPathIds: [],
    assignedCourseIds: [],
    authOrigin: "password",
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
  return (await users.list()).map(toPublicUser);
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

// Looks up or provisions the account an embed link logs into (see
// server/src/index.ts's /api/embed). Returns undefined if that email
// already belongs to a normal password account - an embed link must never
// be able to sign in as an existing real account, even one whose owner
// happens to match the email a caller supplied, so it refuses outright
// rather than reusing or shadowing it.
export async function findOrCreateEmbedUser(email: string): Promise<User | undefined> {
  const lower = email.toLowerCase();
  const matches = await users.list({ email: lower });
  const existing = matches[0];
  if (existing) {
    return existing.authOrigin === "embed" ? toPublicUser(existing) : undefined;
  }

  const stored: StoredUser = {
    userId: crypto.randomUUID(),
    email: lower,
    name: lower,
    role: "student",
    // A random, never-revealed password - this account has no way to log in
    // through the normal password form (an empty/guessable hash here would
    // let anyone who knows this email in that way instead).
    passwordHash: hashPassword(crypto.randomUUID()),
    assignedLearningPathIds: [],
    assignedCourseIds: [],
    authOrigin: "embed",
  };
  try {
    await users.set(stored.userId, stored);
  } catch (err) {
    // Same race as createUser's - a concurrent embed request for the same
    // email may have already won by the time this write lands.
    if ((err as { code?: number }).code === 11000) {
      const race = (await users.list({ email: lower }))[0];
      return race && race.authOrigin === "embed" ? toPublicUser(race) : undefined;
    }
    throw err;
  }
  return toPublicUser(stored);
}

// Additive - never removes a course an admin (or an earlier embed visit)
// already granted. A repeat embed visit for a narrower set of courses must
// not silently revoke access to ones granted before it.
export async function grantCourseAccess(userId: string, courseId: string): Promise<User | undefined> {
  const stored = await users.get(userId);
  if (!stored) return undefined;
  const assignedCourseIds = stored.assignedCourseIds ?? [];
  if (assignedCourseIds.includes(courseId)) return toPublicUser(stored);
  const updated = await users.update(userId, { assignedCourseIds: [...assignedCourseIds, courseId] });
  return updated ? toPublicUser(updated) : undefined;
}
