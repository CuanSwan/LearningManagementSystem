import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import {
  getCompletedLessons,
  getLastCompleted,
  initProgressStore,
  setLastCompleted,
  setLessonCompletion,
} from "./progressStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "progress-store-test-"));
  const db: Database = {
    createStore: async (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  await initProgressStore(db);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("getLastCompleted", () => {
  it("returns null when nothing has been recorded yet", async () => {
    expect(await getLastCompleted("u1")).toBeNull();
  });

  it("returns the most recently recorded course/module pair", async () => {
    await setLastCompleted("u1", "c1", "m1");
    await setLastCompleted("u1", "c2", "m2");
    expect(await getLastCompleted("u1")).toEqual({ courseId: "c2", moduleId: "m2" });
  });
});

describe("setLastCompleted and setLessonCompletion", () => {
  it("don't clobber each other - both persist on the same user's progress doc", async () => {
    await setLessonCompletion("u1", "l1", true);
    await setLastCompleted("u1", "c1", "m1");
    expect(await getCompletedLessons("u1")).toEqual(["l1"]);
    expect(await getLastCompleted("u1")).toEqual({ courseId: "c1", moduleId: "m1" });

    await setLessonCompletion("u1", "l2", true);
    expect(await getLastCompleted("u1")).toEqual({ courseId: "c1", moduleId: "m1" });

    await setLastCompleted("u1", "c2", "m2");
    expect(await getCompletedLessons("u1")).toEqual(["l1", "l2"]);
  });

  it("doesn't lose a completion when two lessons complete at the same instant", async () => {
    // Reproduces several auto-completing lessons (e.g. two text lessons)
    // mounting together in the vertical list layout and firing their
    // onComplete within the same tick - each is its own request, racing
    // against the other's unserialized get-then-set.
    await Promise.all([setLessonCompletion("u1", "l1", true), setLessonCompletion("u1", "l2", true)]);
    expect(await getCompletedLessons("u1")).toEqual(expect.arrayContaining(["l1", "l2"]));
    expect(await getCompletedLessons("u1")).toHaveLength(2);
  });
});
