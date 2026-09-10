import type { Course, LessonDisplayMode, Module, User, UserRole } from "@lms/shared";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      typeof body?.error === "string"
        ? body.error
        : Array.isArray(body?.error)
          ? body.error.map((issue: { message: string }) => issue.message).join("; ")
          : `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export async function me(): Promise<User | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function login(email: string, password: string): Promise<User> {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function register(email: string, name: string, password: string): Promise<User> {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, name, password }) });
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export function listUsers(): Promise<User[]> {
  return request("/api/users");
}

export function createUser(input: { email: string; name: string; password: string; role: UserRole }): Promise<User> {
  return request("/api/users", { method: "POST", body: JSON.stringify(input) });
}

export function setUserRole(userId: string, role: UserRole): Promise<User> {
  return request(`/api/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
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

export function getProgress(): Promise<{ completedLessonIds: string[] }> {
  return request("/api/progress");
}

export function setLessonProgress(lessonId: string, completed: boolean): Promise<{ completedLessonIds: string[] }> {
  return request(`/api/progress/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify({ completed }) });
}

export function getPreferences(): Promise<{ lessonDisplayMode: LessonDisplayMode | null }> {
  return request("/api/preferences");
}

export function setPreferences(lessonDisplayMode: LessonDisplayMode): Promise<{ lessonDisplayMode: LessonDisplayMode }> {
  return request("/api/preferences", { method: "PUT", body: JSON.stringify({ lessonDisplayMode }) });
}
