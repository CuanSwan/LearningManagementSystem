import { parseCourse, parseModule, type Course, type Module } from "@lms/shared";

const courses = new Map<string, Course>();
const modules = new Map<string, Module>();

export function listCourses(): Course[] {
  return [...courses.values()];
}

export function getCourse(courseId: string): Course | undefined {
  return courses.get(courseId);
}

export function createCourse(data: unknown): Course {
  const course = parseCourse(data);
  courses.set(course.courseId, course);
  return course;
}

export function patchCourse(
  courseId: string,
  patch: { title?: string; description?: string; theme?: unknown }
): Course | undefined {
  const existing = courses.get(courseId);
  if (!existing) return undefined;
  const merged = parseCourse({ ...existing, ...patch, courseId });
  courses.set(courseId, merged);
  return merged;
}

export function listModulesByCourse(courseId: string): Module[] {
  return [...modules.values()].filter((m) => m.courseId === courseId);
}

export function getModule(moduleId: string): Module | undefined {
  return modules.get(moduleId);
}

export function createModule(input: { courseId: string; title: string; objective: string }): Module {
  const module = parseModule({
    moduleId: crypto.randomUUID(),
    courseId: input.courseId,
    status: "draft",
    seed: { title: input.title, objective: input.objective },
    lessons: [],
  });
  modules.set(module.moduleId, module);
  return module;
}

export function saveModule(moduleId: string, data: unknown): Module {
  const module = parseModule({ ...(data as object), moduleId });
  modules.set(moduleId, module);
  return module;
}

export function seedCourse(course: Course): void {
  courses.set(course.courseId, course);
}

export function seedModule(module: Module): void {
  modules.set(module.moduleId, module);
}
