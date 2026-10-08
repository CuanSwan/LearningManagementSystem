import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import {
  checkPasswordResetToken,
  createPasswordReset,
  getPasswordReset,
  initPasswordResetStore,
  markPasswordResetUsed,
  PASSWORD_RESET_VALIDITY_MS,
} from "./passwordResetStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "passwordresetstore-test-"));
  const db: Database = {
    createStore: async (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  await initPasswordResetStore(db);
});

afterEach(async () => {
  vi.useRealTimers();
  await rm(dir, { recursive: true, force: true });
});

describe("createPasswordReset", () => {
  it("issues a token that expires one hour from now", async () => {
    const before = Date.now();
    const reset = await createPasswordReset({ userId: "u1", email: "A@Example.com" });
    expect(reset.userId).toBe("u1");
    expect(reset.email).toBe("a@example.com");
    expect(reset.expiresAt - reset.issuedAt).toBe(PASSWORD_RESET_VALIDITY_MS);
    expect(reset.issuedAt).toBeGreaterThanOrEqual(before);
    expect(reset.usedAt).toBeUndefined();
  });

  it("is retrievable by its tokenId", async () => {
    const reset = await createPasswordReset({ userId: "u1", email: "a@example.com" });
    const fetched = await getPasswordReset(reset.tokenId);
    expect(fetched).toEqual(reset);
  });
});

describe("checkPasswordResetToken", () => {
  it("accepts a fresh, unused token", async () => {
    const reset = await createPasswordReset({ userId: "u1", email: "a@example.com" });
    expect(checkPasswordResetToken(reset)).toBeNull();
  });

  it("rejects a used token", async () => {
    const reset = await createPasswordReset({ userId: "u1", email: "a@example.com" });
    await markPasswordResetUsed(reset.tokenId);
    const updated = await getPasswordReset(reset.tokenId);
    expect(checkPasswordResetToken(updated!)).toBe("used");
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const reset = await createPasswordReset({ userId: "u1", email: "a@example.com" });
    vi.setSystemTime(PASSWORD_RESET_VALIDITY_MS + 1);
    expect(checkPasswordResetToken(reset)).toBe("expired");
  });
});

describe("markPasswordResetUsed", () => {
  it("sets usedAt on the stored record", async () => {
    const reset = await createPasswordReset({ userId: "u1", email: "a@example.com" });
    await markPasswordResetUsed(reset.tokenId);
    const updated = await getPasswordReset(reset.tokenId);
    expect(updated?.usedAt).toBeDefined();
  });
});
