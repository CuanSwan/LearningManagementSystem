import type { Database, DocumentStore } from "./db/index.js";
import { parseCourse, parseLearningPath, parseModule, type Course, type LearningPath, type Module } from "./schemas.js";

let courses: DocumentStore<Course>;
let modules: DocumentStore<Module>;
let learningPaths: DocumentStore<LearningPath>;

export function initStore(db: Database): void {
  courses = db.createStore<Course>("courses", "courseId");
  modules = db.createStore<Module>("modules", "moduleId");
  learningPaths = db.createStore<LearningPath>("learningPaths", "pathId");
}

export function listCourses(): Promise<Course[]> {
  return courses.list();
}

export async function getCourse(courseId: string): Promise<Course | undefined> {
  return (await courses.get(courseId)) ?? undefined;
}

export async function createCourse(data: unknown): Promise<Course> {
  const course = parseCourse(data);
  await courses.set(course.courseId, course);
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

export function seedCourse(course: Course): Promise<void> {
  return courses.set(course.courseId, course);
}

export function seedModule(module: Module): Promise<void> {
  return modules.set(module.moduleId, module);
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

export function seedLearningPath(path: LearningPath): Promise<void> {
  return learningPaths.set(path.pathId, path);
}
