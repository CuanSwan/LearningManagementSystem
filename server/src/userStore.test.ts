import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import { createUser, initUserStore, updatePassword, verifyCredentials, verifyCurrentPassword } from "./userStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "userstore-test-"));
  const db: Database = {
    createStore: async (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  await initUserStore(db);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("updatePassword", () => {
  it("lets the new password log in and rejects the old one", async () => {
    const user = await createUser({ email: "a@b.com", name: "A", password: "OldPassword1", role: "student" });

    await updatePassword(user.userId, "NewPassword2");

    expect(await verifyCredentials("a@b.com", "OldPassword1")).toBeUndefined();
    const loggedIn = await verifyCredentials("a@b.com", "NewPassword2");
    expect(loggedIn?.userId).toBe(user.userId);
  });

  it("returns false for a userId that doesn't exist", async () => {
    expect(await updatePassword("missing", "NewPassword2")).toBe(false);
  });
});

describe("verifyCurrentPassword", () => {
  it("confirms the account's current password", async () => {
    const user = await createUser({ email: "a@b.com", name: "A", password: "OldPassword1", role: "student" });
    expect(await verifyCurrentPassword(user.userId, "OldPassword1")).toBe(true);
    expect(await verifyCurrentPassword(user.userId, "WrongPassword")).toBe(false);
  });

  it("returns false for a userId that doesn't exist", async () => {
    expect(await verifyCurrentPassword("missing", "anything")).toBe(false);
  });
});
