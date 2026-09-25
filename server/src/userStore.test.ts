import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import {
  createUser,
  findOrCreateEmbedUser,
  grantCourseAccess,
  initUserStore,
  setUserAssignments,
  updatePassword,
  verifyCredentials,
  verifyCurrentPassword,
} from "./userStore.js";

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

describe("createUser", () => {
  it("starts a new user with no assignments", async () => {
    const user = await createUser({ email: "a@b.com", name: "A", password: "Password1", role: "student" });
    expect(user.assignedLearningPathIds).toEqual([]);
    expect(user.assignedCourseIds).toEqual([]);
  });
});

describe("setUserAssignments", () => {
  it("updates a user's assigned learning paths and courses", async () => {
    const user = await createUser({ email: "a@b.com", name: "A", password: "Password1", role: "student" });
    const updated = await setUserAssignments(user.userId, {
      assignedLearningPathIds: ["p1"],
      assignedCourseIds: ["c1", "c2"],
    });
    expect(updated?.assignedLearningPathIds).toEqual(["p1"]);
    expect(updated?.assignedCourseIds).toEqual(["c1", "c2"]);
  });

  it("returns undefined for a userId that doesn't exist", async () => {
    expect(await setUserAssignments("missing", { assignedLearningPathIds: [], assignedCourseIds: [] })).toBeUndefined();
  });
});

describe("findOrCreateEmbedUser", () => {
  it("provisions a new passwordless student account on first use", async () => {
    const user = await findOrCreateEmbedUser("student@example.com");
    expect(user?.role).toBe("student");
    expect(user?.authOrigin).toBe("embed");
    expect(user?.assignedCourseIds).toEqual([]);
  });

  it("reuses the same account on a repeat visit instead of creating another", async () => {
    const first = await findOrCreateEmbedUser("student@example.com");
    const second = await findOrCreateEmbedUser("student@example.com");
    expect(second?.userId).toBe(first?.userId);
  });

  it("refuses an email that already belongs to a normal password account", async () => {
    const real = await createUser({ email: "admin@example.com", name: "Admin", password: "Password1", role: "admin" });
    const result = await findOrCreateEmbedUser("admin@example.com");
    expect(result).toBeUndefined();
    // And doesn't touch the real account either.
    expect(await verifyCredentials("admin@example.com", "Password1")).not.toBeUndefined();
    expect(real.authOrigin).toBe("password");
  });

  it("is case-insensitive about email, matching createUser/verifyCredentials", async () => {
    const first = await findOrCreateEmbedUser("Student@Example.com");
    const second = await findOrCreateEmbedUser("student@example.com");
    expect(second?.userId).toBe(first?.userId);
  });
});

describe("grantCourseAccess", () => {
  it("adds a course to a user with no prior assignments", async () => {
    const user = await findOrCreateEmbedUser("student@example.com");
    const updated = await grantCourseAccess(user!.userId, "c1");
    expect(updated?.assignedCourseIds).toEqual(["c1"]);
  });

  it("is additive - never drops a course already granted", async () => {
    const user = await findOrCreateEmbedUser("student@example.com");
    await grantCourseAccess(user!.userId, "c1");
    const updated = await grantCourseAccess(user!.userId, "c2");
    expect(updated?.assignedCourseIds).toEqual(["c1", "c2"]);
  });

  it("doesn't duplicate a course granted twice", async () => {
    const user = await findOrCreateEmbedUser("student@example.com");
    await grantCourseAccess(user!.userId, "c1");
    const updated = await grantCourseAccess(user!.userId, "c1");
    expect(updated?.assignedCourseIds).toEqual(["c1"]);
  });

  it("returns undefined for a userId that doesn't exist", async () => {
    expect(await grantCourseAccess("missing", "c1")).toBeUndefined();
  });
});
