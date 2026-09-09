import crypto from "node:crypto";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const storedKey = Buffer.from(hashHex, "hex");
  return derivedKey.length === storedKey.length && crypto.timingSafeEqual(derivedKey, storedKey);
}

// In-memory session store: sessionId -> userId. Lost on server restart,
// same as the rest of this app's state - a real deployment would back
// this with a DB or a signed/stateless token instead.
const sessions = new Map<string, string>();

export function createSession(userId: string): string {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, userId);
  return sessionId;
}

export function getSessionUserId(sessionId: string | undefined): string | undefined {
  if (!sessionId) return undefined;
  return sessions.get(sessionId);
}

export function destroySession(sessionId: string | undefined): void {
  if (sessionId) sessions.delete(sessionId);
}
