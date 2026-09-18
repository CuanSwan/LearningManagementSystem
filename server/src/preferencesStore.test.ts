import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import {
  getColorScheme,
  getLessonDisplayMode,
  initPreferencesStore,
  setColorScheme,
  setLessonDisplayMode,
} from "./preferencesStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "preferences-store-test-"));
  const db: Database = {
    createStore: async (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  await initPreferencesStore(db);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("getColorScheme", () => {
  it("returns null when nothing has been chosen yet", async () => {
    expect(await getColorScheme("u1")).toBeNull();
  });

  it("returns the most recently set color scheme", async () => {
    await setColorScheme("u1", "dark");
    expect(await getColorScheme("u1")).toBe("dark");
    await setColorScheme("u1", "light");
    expect(await getColorScheme("u1")).toBe("light");
  });
});

describe("setColorScheme and setLessonDisplayMode", () => {
  it("don't clobber each other - both persist on the same user's preference doc", async () => {
    await setLessonDisplayMode("u1", "carousel");
    await setColorScheme("u1", "dark");
    expect(await getLessonDisplayMode("u1")).toBe("carousel");
    expect(await getColorScheme("u1")).toBe("dark");

    await setLessonDisplayMode("u1", "accessible");
    expect(await getColorScheme("u1")).toBe("dark");

    await setColorScheme("u1", "light");
    expect(await getLessonDisplayMode("u1")).toBe("accessible");
  });
});
