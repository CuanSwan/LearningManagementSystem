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

// Progress and display preference stand in for what would normally be tied to a
// logged-in student. There's no login here, so they live in sessionStorage instead
// of localStorage - a temporary, per-tab stand-in just for this design-review prototype.
const PROGRESS_KEY = "lms-prototype-progress-v1";
const PREFERENCE_KEY = "lms-prototype-preference-v1";

export type LessonDisplayMode = "vertical" | "carousel";

function loadProgress(): Set<string> {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function loadPreference(): LessonDisplayMode | null {
  try {
    const raw = sessionStorage.getItem(PREFERENCE_KEY);
    if (raw === "vertical" || raw === "carousel") return raw;
  } catch {
    // ignore
  }
  return null;
}

let completedLessonIds = loadProgress();
let lessonDisplayMode = loadPreference();

function persistProgress() {
  try {
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify([...completedLessonIds]));
  } catch {
    // ignore
  }
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 150));
}

export function resetDemoData(): void {
  snapshot = freshSnapshot();
  completedLessonIds = new Set();
  lessonDisplayMode = null;
  persist();
  try {
    sessionStorage.removeItem(PROGRESS_KEY);
    sessionStorage.removeItem(PREFERENCE_KEY);
  } catch {
    // ignore
  }
}

export function getProgress(): Promise<{ completedLessonIds: string[] }> {
  return delay({ completedLessonIds: [...completedLessonIds] });
}

export function setLessonProgress(lessonId: string, completed: boolean): Promise<{ completedLessonIds: string[] }> {
  if (completed) completedLessonIds.add(lessonId);
  else completedLessonIds.delete(lessonId);
  persistProgress();
  return delay({ completedLessonIds: [...completedLessonIds] });
}

export function getPreferences(): Promise<{ lessonDisplayMode: LessonDisplayMode | null }> {
  return delay({ lessonDisplayMode });
}

export function setPreferences(mode: LessonDisplayMode): Promise<{ lessonDisplayMode: LessonDisplayMode }> {
  lessonDisplayMode = mode;
  try {
    sessionStorage.setItem(PREFERENCE_KEY, mode);
  } catch {
    // ignore
  }
  return delay({ lessonDisplayMode: mode });
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
