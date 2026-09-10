import { parseCourse, parseModule, type Course, type Module } from "@lms/shared";
import { seedCourses, seedModules } from "./sampleData.js";

const STORAGE_KEY = "lms-prototype-data-v1";

interface Snapshot {
  courses: Course[];
  modules: Module[];
}

function freshSnapshot(): Snapshot {
  return { courses: seedCourses(), modules: seedModules() };
}

function loadSnapshot(): Snapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Snapshot;
  } catch {
    // Corrupt or blocked storage - fall through to a fresh seed.
  }
  return freshSnapshot();
}

let snapshot = loadSnapshot();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage unavailable (e.g. private browsing) - edits just won't survive a reload.
  }
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 150));
}

export function resetDemoData(): void {
  snapshot = freshSnapshot();
  persist();
  location.reload();
}

export function listCourses(): Promise<Course[]> {
  return delay([...snapshot.courses]);
}

export function getCourse(courseId: string): Promise<Course> {
  const course = snapshot.courses.find((c) => c.courseId === courseId);
  if (!course) return Promise.reject(new Error("Course not found"));
  return delay(course);
}

export function createCourse(input: {
  title: string;
  description?: string;
  theme?: Partial<Course["theme"]>;
}): Promise<Course> {
  const course = parseCourse({
    courseId: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    theme: input.theme ?? {},
  });
  snapshot.courses.push(course);
  persist();
  return delay(course);
}

export function patchCourse(
  courseId: string,
  patch: { title?: string; description?: string; theme?: Partial<Course["theme"]> }
): Promise<Course> {
  const existing = snapshot.courses.find((c) => c.courseId === courseId);
  if (!existing) return Promise.reject(new Error("Course not found"));
  const merged = parseCourse({ ...existing, ...patch, courseId });
  snapshot.courses = snapshot.courses.map((c) => (c.courseId === courseId ? merged : c));
  persist();
  return delay(merged);
}

export function listModulesByCourse(courseId: string): Promise<Module[]> {
  return delay(snapshot.modules.filter((m) => m.courseId === courseId));
}

export function getModule(moduleId: string): Promise<Module> {
  const module = snapshot.modules.find((m) => m.moduleId === moduleId);
  if (!module) return Promise.reject(new Error("Module not found"));
  return delay(module);
}

export function createModule(input: { courseId: string; title: string; objective: string }): Promise<Module> {
  const module = parseModule({
    moduleId: crypto.randomUUID(),
    courseId: input.courseId,
    status: "draft",
    seed: { title: input.title, objective: input.objective },
    lessons: [],
  });
  snapshot.modules.push(module);
  persist();
  return delay(module);
}

export function saveModule(moduleId: string, data: unknown): Promise<Module> {
  const module = parseModule({ ...(data as object), moduleId });
  snapshot.modules = snapshot.modules.map((m) => (m.moduleId === moduleId ? module : m));
  persist();
  return delay(module);
}
