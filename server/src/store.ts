import type { Database, DocumentStore } from "./db/index.js";
import { parseCourse, parseLearningPath, parseModule, type Course, type LearningPath, type Module } from "./schemas.js";

let courses: DocumentStore<Course>;
let modules: DocumentStore<Module>;
let learningPaths: DocumentStore<LearningPath>;

export async function initStore(db: Database): Promise<void> {
  [courses, modules, learningPaths] = await Promise.all([
    db.createStore<Course>("courses", "courseId"),
    db.createStore<Module>("modules", "moduleId"),
    db.createStore<LearningPath>("learningPaths", "pathId"),
  ]);
}

export function listCourses(): Promise<Course[]> {
  return courses.list();
}

export async function getCourse(courseId: string): Promise<Course | undefined> {
  return (await courses.get(courseId)) ?? undefined;
}

// Every course, however it's created (the admin "Create a course" form or a
// Rise import), starts with these four required lessons - orientation
// video, exam breakdown, study plan, additional resources - as a mandatory
// first module. They're blank for the admin to fill in, not shared
// boilerplate text: each course's orientation content is its own.
const ORIENTATION_MODULE_TITLE = "Course Orientation";
const ORIENTATION_MODULE_OBJECTIVE =
  "Watch the orientation video and review the exam breakdown, study plan, and additional resources before starting the course.";

function orientationLesson(order: number, type: "video", content: { videoUrl: string }): unknown;
function orientationLesson(order: number, type: "text", content: { body: string }): unknown;
function orientationLesson(order: number, type: "video" | "text", content: unknown): unknown {
  return {
    lessonId: crypto.randomUUID(),
    schemaVersion: 1,
    source: "human",
    wordingStyle: "shortened",
    order,
    type,
    content,
  };
}

async function createOrientationModule(courseId: string): Promise<void> {
  const module = parseModule({
    moduleId: crypto.randomUUID(),
    courseId,
    status: "draft",
    seed: { title: ORIENTATION_MODULE_TITLE, objective: ORIENTATION_MODULE_OBJECTIVE },
    lessons: [
      orientationLesson(1, "video", { videoUrl: "" }),
      orientationLesson(2, "text", { body: "<h2>Exam Breakdown</h2>" }),
      orientationLesson(3, "text", { body: "<h2>Study Plan</h2>" }),
      orientationLesson(4, "text", { body: "<h2>Additional Resources</h2>" }),
    ],
  });
  await modules.set(module.moduleId, module);
}

export async function createCourse(data: unknown): Promise<Course> {
  const course = parseCourse(data);
  await courses.set(course.courseId, course);
  await createOrientationModule(course.courseId);
  return course;
}

export async function patchCourse(
  courseId: string,
  patch: { title?: string; description?: string; category?: string; theme?: unknown }
): Promise<Course | undefined> {
  const existing = await courses.get(courseId);
  if (!existing) return undefined;
  const merged = parseCourse({ ...existing, ...patch, courseId });
  await courses.set(courseId, merged);
  return merged;
}

export function listModulesByCourse(courseId: string): Promise<Module[]> {
  return modules.list({ courseId });
}

// Deletes a course. Its modules are never silently destroyed with it - each
// one goes through the same unassign path as removing a single module (kept
// as a reusable library entry if it has content, deleted outright if it
// doesn't), and any learning path that included this course has it dropped
// so it doesn't end up pointing at a course that no longer exists.
export async function deleteCourse(courseId: string): Promise<boolean> {
  const courseModules = await modules.list({ courseId });
  await Promise.all(courseModules.map((m) => unassignModule(m.moduleId)));

  const paths = await learningPaths.list();
  await Promise.all(
    paths
      .filter((p) => p.courseIds.includes(courseId))
      .map((p) =>
        learningPaths.set(p.pathId, parseLearningPath({ ...p, courseIds: p.courseIds.filter((id) => id !== courseId) }))
      )
  );

  return courses.remove(courseId);
}

export function listAllModules(): Promise<Module[]> {
  return modules.list();
}

export async function getModule(moduleId: string): Promise<Module | undefined> {
  return (await modules.get(moduleId)) ?? undefined;
}

export async function createModule(input: {
  courseId?: string;
  category?: string;
  title: string;
  objective: string;
  lessons?: unknown[];
}): Promise<Module> {
  const module = parseModule({
    moduleId: crypto.randomUUID(),
    courseId: input.courseId,
    category: input.courseId ? undefined : (input.category ?? "Uncategorized"),
    status: "draft",
    seed: { title: input.title, objective: input.objective },
    lessons: input.lessons ?? [],
  });
  await modules.set(module.moduleId, module);
  return module;
}

export async function saveModule(moduleId: string, data: unknown): Promise<Module> {
  const module = parseModule({ ...(data as object), moduleId });
  await modules.set(moduleId, module);
  return module;
}

// Removes a module from its course, turning it into a reusable library entry
// (see ModuleSchema's `category`). A module with no content yet is just
// deleted outright instead - an empty unassigned module is clutter, not a
// reusable component, so it isn't worth keeping around.
export async function unassignModule(moduleId: string): Promise<Module | null> {
  const existing = await modules.get(moduleId);
  if (!existing) return null;

  if (existing.lessons.length === 0) {
    await modules.remove(moduleId);
    return null;
  }

  const course = existing.courseId ? await courses.get(existing.courseId) : null;
  const updated = parseModule({
    ...existing,
    courseId: undefined,
    category: course?.category ?? existing.category ?? "Uncategorized",
  });
  await modules.set(moduleId, updated);
  return updated;
}

export async function deleteModule(moduleId: string): Promise<boolean> {
  return modules.remove(moduleId);
}

// Seeding only creates a record the first time it's ever seen - once a
// course/module/path exists, an admin may have edited it, and a later
// restart re-running this seed data must not clobber that edit back to the
// original seed content.
export async function seedCourse(course: Course): Promise<void> {
  if (await courses.get(course.courseId)) return;
  await courses.set(course.courseId, course);
}

export async function seedModule(module: Module): Promise<void> {
  if (await modules.get(module.moduleId)) return;
  await modules.set(module.moduleId, module);
}

export function listLearningPaths(): Promise<LearningPath[]> {
  return learningPaths.list();
}

export async function getLearningPath(pathId: string): Promise<LearningPath | undefined> {
  return (await learningPaths.get(pathId)) ?? undefined;
}

export async function createLearningPath(data: unknown): Promise<LearningPath> {
  const path = parseLearningPath(data);
  await learningPaths.set(path.pathId, path);
  return path;
}

export async function patchLearningPath(
  pathId: string,
  patch: { title?: string; description?: string; courseIds?: string[] }
): Promise<LearningPath | undefined> {
  const existing = await learningPaths.get(pathId);
  if (!existing) return undefined;
  const merged = parseLearningPath({ ...existing, ...patch, pathId });
  await learningPaths.set(pathId, merged);
  return merged;
}

export async function seedLearningPath(path: LearningPath): Promise<void> {
  if (await learningPaths.get(path.pathId)) return;
  await learningPaths.set(path.pathId, path);
}
