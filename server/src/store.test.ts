import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import { parseCourse, parseLearningPath, parseModule } from "./schemas.js";
import type { User } from "./userSchema.js";
import {
  createCourse,
  createLearningPath,
  getCourse,
  getLearningPath,
  getModule,
  initStore,
  listModulesByCourse,
  patchCourse,
  patchLearningPath,
  saveModule,
  seedCourse,
  seedLearningPath,
  seedModule,
  userHasCourseAccess,
} from "./store.js";

function studentWith(assignments: Partial<Pick<User, "assignedLearningPathIds" | "assignedCourseIds">>): User {
  return {
    userId: "u1",
    email: "student@example.com",
    name: "Student",
    role: "student",
    assignedLearningPathIds: [],
    assignedCourseIds: [],
    authOrigin: "password",
    ...assignments,
  };
}

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "store-test-"));
  const db: Database = {
    createStore: async (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  await initStore(db);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("createCourse", () => {
  it("automatically creates a mandatory orientation module with the required lessons", async () => {
    const course = await createCourse({ courseId: "c1", title: "New Course" });
    const modules = await listModulesByCourse(course.courseId);

    expect(modules).toHaveLength(1);
    const orientation = modules[0];
    expect(orientation.seed.title).toBe("Course Orientation");
    expect(orientation.status).toBe("draft");
    expect(orientation.lessons.map((l) => l.type)).toEqual(["examBreakdown", "video", "text", "text"]);
    expect(orientation.lessons.map((l) => l.order)).toEqual([1, 2, 3, 4]);
  });

  it("gives each new course its own independent orientation module and content", async () => {
    const a = await createCourse({ courseId: "a", title: "Course A" });
    const b = await createCourse({ courseId: "b", title: "Course B" });

    const [modulesA, modulesB] = await Promise.all([listModulesByCourse(a.courseId), listModulesByCourse(b.courseId)]);
    expect(modulesA[0].moduleId).not.toBe(modulesB[0].moduleId);
    expect(modulesA[0].courseId).toBe("a");
    expect(modulesB[0].courseId).toBe("b");
  });
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

describe("userHasCourseAccess", () => {
  it("always grants access to an admin", async () => {
    const admin: User = { ...studentWith({}), role: "admin" };
    expect(await userHasCourseAccess(admin, "any-course")).toBe(true);
  });

  it("grants access to a directly assigned course", async () => {
    const student = studentWith({ assignedCourseIds: ["c1"] });
    expect(await userHasCourseAccess(student, "c1")).toBe(true);
  });

  it("grants access to a course reached via an assigned learning path", async () => {
    const path = await createLearningPath({ pathId: "p1", title: "Path", courseIds: ["c1", "c2"] });
    const student = studentWith({ assignedLearningPathIds: [path.pathId] });
    expect(await userHasCourseAccess(student, "c2")).toBe(true);
  });

  it("denies access to a course that's neither directly assigned nor in an assigned path", async () => {
    const path = await createLearningPath({ pathId: "p1", title: "Path", courseIds: ["c1"] });
    const student = studentWith({ assignedLearningPathIds: [path.pathId], assignedCourseIds: ["c2"] });
    expect(await userHasCourseAccess(student, "c3")).toBe(false);
  });

  it("denies access to a student with no assignments at all", async () => {
    const student = studentWith({});
    expect(await userHasCourseAccess(student, "c1")).toBe(false);
  });
});
