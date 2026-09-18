import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import {
  getCompletedLessons,
  getLastVisited,
  initProgressStore,
  setLastVisited,
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

describe("getLastVisited", () => {
  it("returns null when nothing has been recorded yet", async () => {
    expect(await getLastVisited("u1")).toBeNull();
  });

  it("returns the most recently recorded course/module pair", async () => {
    await setLastVisited("u1", "c1", "m1");
    await setLastVisited("u1", "c2", "m2");
    expect(await getLastVisited("u1")).toEqual({ courseId: "c2", moduleId: "m2" });
  });
});

describe("setLastVisited and setLessonCompletion", () => {
  it("don't clobber each other - both persist on the same user's progress doc", async () => {
    await setLessonCompletion("u1", "l1", true);
    await setLastVisited("u1", "c1", "m1");
    expect(await getCompletedLessons("u1")).toEqual(["l1"]);
    expect(await getLastVisited("u1")).toEqual({ courseId: "c1", moduleId: "m1" });

    await setLessonCompletion("u1", "l2", true);
    expect(await getLastVisited("u1")).toEqual({ courseId: "c1", moduleId: "m1" });

    await setLastVisited("u1", "c2", "m2");
    expect(await getCompletedLessons("u1")).toEqual(["l1", "l2"]);
  });
});
