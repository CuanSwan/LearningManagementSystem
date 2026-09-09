import type { Course, Module } from "@lms/shared";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  return res.json();
}

export function listCourses(): Promise<Course[]> {
  return request("/api/courses");
}

export function getCourse(courseId: string): Promise<Course> {
  return request(`/api/courses/${courseId}`);
}

export function createCourse(input: {
  title: string;
  description?: string;
  theme?: Partial<Course["theme"]>;
}): Promise<Course> {
  return request("/api/courses", { method: "POST", body: JSON.stringify(input) });
}

export function patchCourse(
  courseId: string,
  patch: { title?: string; description?: string; theme?: Partial<Course["theme"]> }
): Promise<Course> {
  return request(`/api/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function listModulesByCourse(courseId: string): Promise<Module[]> {
  return request(`/api/courses/${courseId}/modules`);
}

export function getModule(moduleId: string): Promise<Module> {
  return request(`/api/modules/${moduleId}`);
}

export function createModule(input: { courseId: string; title: string; objective: string }): Promise<Module> {
  return request("/api/modules", { method: "POST", body: JSON.stringify(input) });
}

export function saveModule(moduleId: string, module: Module): Promise<Module> {
  return request(`/api/modules/${moduleId}`, { method: "PUT", body: JSON.stringify(module) });
}
