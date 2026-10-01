import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import { parseCourse, parseLearningPath, parseModule, type User } from "./schemas.js";
import {
  backfillMissingLessonTitles,
  backfillModuleOrder,
  backfillOrientationVideos,
  createCourse,
  createLearningPath,
  createModule,
  deleteModule,
  getCourse,
  getLearningPath,
  getModule,
  initStore,
  listModulesByCourse,
  patchCourse,
  patchLearningPath,
  reorderModules,
  saveModule,
  seedCourse,
  seedLearningPath,
  seedModule,
  userHasCourseAccess,
} from "./store.js";
import type { Module } from "./schemas.js";

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

describe("backfillMissingLessonTitles", () => {
  it("recovers a lesson's title from the lookup map, falling back to a generic one otherwise", async () => {
    // Simulates a record written before `title` was required - seedModule
    // writes it as-is (no schema validation) the same way legacy data on
    // disk would have been.
    const staleModule = {
      moduleId: "m-stale",
      courseId: "c1",
      status: "published",
      seed: { title: "Stale Module", objective: "Objective" },
      lessons: [
        {
          lessonId: "known-lesson",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          type: "text",
          content: { body: "x" },
        },
        {
          lessonId: "unknown-lesson",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 2,
          type: "text",
          content: { body: "y" },
        },
      ],
    } as unknown as Module;
    await seedModule(staleModule);

    await backfillMissingLessonTitles(new Map([["known-lesson", "Recovered Title"]]));

    const fixed = await getModule("m-stale");
    expect(fixed?.lessons.find((l) => l.lessonId === "known-lesson")?.title).toBe("Recovered Title");
    expect(fixed?.lessons.find((l) => l.lessonId === "unknown-lesson")?.title).toBe("Untitled lesson");
  });

  it("leaves a module with no missing titles untouched", async () => {
    await createModule({ courseId: "c1", title: "Fine Module", objective: "Objective" });
    await backfillMissingLessonTitles();
    const modules = await listModulesByCourse("c1");
    expect(modules).toHaveLength(1);
  });
});

describe("backfillOrientationVideos", () => {
  it("points an existing course's Orientation Video lesson at the shared Vimeo link", async () => {
    const course = await createCourse({ courseId: "c1", title: "Backfill Check" });
    const [module] = await listModulesByCourse(course.courseId);
    const orientationVideo = module.lessons.find((l) => l.title === "Orientation Video");
    await saveModule(module.moduleId, {
      ...module,
      lessons: module.lessons.map((l) =>
        l.lessonId === orientationVideo!.lessonId ? { ...l, content: { ...l.content, videoUrl: "https://vimeo.com/999" } } : l
      ),
    });

    await backfillOrientationVideos();

    const fixed = await getModule(module.moduleId);
    const fixedVideo = fixed!.lessons.find((l) => l.title === "Orientation Video");
    expect((fixedVideo as { content: { videoUrl: string } }).content.videoUrl).toBe("https://vimeo.com/1231936640");
  });

  it("leaves a non-orientation video lesson alone", async () => {
    const module = await createModule({
      title: "Regular Module",
      objective: "Objective",
      lessons: [
        {
          lessonId: "v1",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          title: "A Different Video",
          type: "video",
          content: { videoUrl: "https://vimeo.com/123" },
        },
      ],
    });

    await backfillOrientationVideos();

    const unchanged = await getModule(module.moduleId);
    expect((unchanged!.lessons[0] as { content: { videoUrl: string } }).content.videoUrl).toBe("https://vimeo.com/123");
  });
});

describe("module order", () => {
  it("createModule appends new modules at the end of the course's current order", async () => {
    // createCourse's own mandatory orientation module would otherwise sit
    // first in the list - removed so this test only has to reason about
    // the modules it creates itself.
    await createCourse({ courseId: "c1", title: "Order Check" });
    for (const m of await listModulesByCourse("c1")) await deleteModule(m.moduleId);

    const m1 = await createModule({ courseId: "c1", title: "Module One", objective: "x" });
    const m2 = await createModule({ courseId: "c1", title: "Module Two", objective: "x" });
    expect(m2.order).toBe(m1.order + 1);
    const list = await listModulesByCourse("c1");
    expect(list.map((m) => m.moduleId)).toEqual([m1.moduleId, m2.moduleId]);
  });

  it("reorderModules moves a module and listModulesByCourse reflects the new order", async () => {
    await createCourse({ courseId: "c1", title: "Order Check" });
    for (const m of await listModulesByCourse("c1")) await deleteModule(m.moduleId);

    const m1 = await createModule({ courseId: "c1", title: "Module One", objective: "x" });
    const m2 = await createModule({ courseId: "c1", title: "Module Two", objective: "x" });
    const m3 = await createModule({ courseId: "c1", title: "Module Three", objective: "x" });

    await reorderModules("c1", [m3.moduleId, m1.moduleId, m2.moduleId]);

    const list = await listModulesByCourse("c1");
    expect(list.map((m) => m.moduleId)).toEqual([m3.moduleId, m1.moduleId, m2.moduleId]);
  });

  it("backfillModuleOrder assigns each module in an unmigrated course its current position", async () => {
    // Simulates modules saved before `order` existed - seedModule writes
    // them as-is (no schema validation), the same way legacy data on disk
    // would have been.
    await createCourse({ courseId: "c1", title: "Backfill Order Check" });
    const existingModules = await listModulesByCourse("c1");
    for (const m of existingModules) await deleteModule(m.moduleId);

    const staleA = { moduleId: "m-a", courseId: "c1", status: "draft", seed: { title: "A", objective: "x" }, lessons: [] } as unknown as Module;
    const staleB = { moduleId: "m-b", courseId: "c1", status: "draft", seed: { title: "B", objective: "x" }, lessons: [] } as unknown as Module;
    await seedModule(staleA);
    await seedModule(staleB);

    await backfillModuleOrder();

    const fixedA = await getModule("m-a");
    const fixedB = await getModule("m-b");
    expect(fixedA?.order).toBe(0);
    expect(fixedB?.order).toBe(1);
  });

  it("backfillModuleOrder leaves an already-reordered course alone", async () => {
    await createCourse({ courseId: "c1", title: "Order Check" });
    for (const m of await listModulesByCourse("c1")) await deleteModule(m.moduleId);

    const m1 = await createModule({ courseId: "c1", title: "Module One", objective: "x" });
    const m2 = await createModule({ courseId: "c1", title: "Module Two", objective: "x" });
    await reorderModules("c1", [m2.moduleId, m1.moduleId]);

    await backfillModuleOrder();

    const list = await listModulesByCourse("c1");
    expect(list.map((m) => m.moduleId)).toEqual([m2.moduleId, m1.moduleId]);
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
  it("always grants access to an admin, even to a draft course", async () => {
    await createCourse({ courseId: "any-course", title: "Draft Course" });
    const admin: User = { ...studentWith({}), role: "admin" };
    expect(await userHasCourseAccess(admin, "any-course")).toBe(true);
  });

  it("grants access to a directly assigned, published course", async () => {
    await createCourse({ courseId: "c1", title: "Course 1", status: "published" });
    const student = studentWith({ assignedCourseIds: ["c1"] });
    expect(await userHasCourseAccess(student, "c1")).toBe(true);
  });

  it("denies access to a directly assigned course that's still a draft", async () => {
    await createCourse({ courseId: "c1", title: "Course 1" });
    const student = studentWith({ assignedCourseIds: ["c1"] });
    expect(await userHasCourseAccess(student, "c1")).toBe(false);
  });

  it("grants access to a published course reached via an assigned learning path", async () => {
    await createCourse({ courseId: "c1", title: "Course 1", status: "published" });
    await createCourse({ courseId: "c2", title: "Course 2", status: "published" });
    const path = await createLearningPath({ pathId: "p1", title: "Path", courseIds: ["c1", "c2"] });
    const student = studentWith({ assignedLearningPathIds: [path.pathId] });
    expect(await userHasCourseAccess(student, "c2")).toBe(true);
  });

  it("denies access to a course that's neither directly assigned nor in an assigned path", async () => {
    await createCourse({ courseId: "c1", title: "Course 1", status: "published" });
    await createCourse({ courseId: "c3", title: "Course 3", status: "published" });
    const path = await createLearningPath({ pathId: "p1", title: "Path", courseIds: ["c1"] });
    const student = studentWith({ assignedLearningPathIds: [path.pathId], assignedCourseIds: ["c2"] });
    expect(await userHasCourseAccess(student, "c3")).toBe(false);
  });

  it("denies access to a student with no assignments at all", async () => {
    await createCourse({ courseId: "c1", title: "Course 1", status: "published" });
    const student = studentWith({});
    expect(await userHasCourseAccess(student, "c1")).toBe(false);
  });

  it("denies access to a course that doesn't exist", async () => {
    const student = studentWith({ assignedCourseIds: ["missing"] });
    expect(await userHasCourseAccess(student, "missing")).toBe(false);
  });
});
