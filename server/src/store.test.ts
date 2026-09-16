import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import { parseCourse, parseLearningPath, parseModule } from "./schemas.js";
import {
  getCourse,
  getLearningPath,
  getModule,
  initStore,
  patchCourse,
  patchLearningPath,
  saveModule,
  seedCourse,
  seedLearningPath,
  seedModule,
} from "./store.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "store-test-"));
  const db: Database = {
    createStore: (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  initStore(db);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("seedCourse", () => {
  it("creates a course that doesn't exist yet", async () => {
    const course = parseCourse({ courseId: "c1", title: "Original Title" });
    await seedCourse(course);
    expect(await getCourse("c1")).toEqual(course);
  });

  it("does not overwrite an admin's edits to an already-seeded course", async () => {
    const course = parseCourse({ courseId: "c1", title: "Original Title" });
    await seedCourse(course);
    await patchCourse("c1", { title: "Admin Renamed This" });

    // Simulate a server restart re-running the same seed data.
    await seedCourse(course);

    expect((await getCourse("c1"))?.title).toBe("Admin Renamed This");
  });
});

describe("seedModule", () => {
  it("does not overwrite an admin's edits to an already-seeded module", async () => {
    const seed = parseModule({
      moduleId: "m1",
      courseId: "c1",
      status: "published",
      seed: { title: "Seed Title", objective: "Seed objective" },
      lessons: [],
    });
    await seedModule(seed);
    await saveModule("m1", { ...seed, status: "draft" });

    // Simulate a server restart re-running the same seed data.
    await seedModule(seed);

    expect((await getModule("m1"))?.status).toBe("draft");
  });
});

describe("seedLearningPath", () => {
  it("does not overwrite an admin's edits to an already-seeded learning path", async () => {
    const path1 = parseLearningPath({ pathId: "p1", title: "Original Path", courseIds: [] });
    await seedLearningPath(path1);
    await patchLearningPath("p1", { title: "Admin Renamed Path" });

    // Simulate a server restart re-running the same seed data.
    await seedLearningPath(path1);

    expect((await getLearningPath("p1"))?.title).toBe("Admin Renamed Path");
  });
});
