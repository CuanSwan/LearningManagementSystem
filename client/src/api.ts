import type { ColorScheme, Course, LearningPath, Lesson, LessonDisplayMode, Module, User, UserRole } from "./types.js";

// In production this points at the deployed API (e.g. Render); in local
// dev it's left empty and vite.config.ts's proxy forwards /api requests
// to localhost:4000 instead.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: "include" });
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
  await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
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

export function setUserAssignments(
  userId: string,
  assignments: { assignedLearningPathIds: string[]; assignedCourseIds: string[] }
): Promise<User> {
  return request(`/api/users/${userId}/assignments`, { method: "PATCH", body: JSON.stringify(assignments) });
}

// Self-service: the caller's own password change, requires their current one.
export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me/password`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : `Request failed: ${res.status}`);
  }
}

// super_admin resetting another user's password - no current-password check.
export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : `Request failed: ${res.status}`);
  }
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
  category?: string;
  theme?: Partial<Course["theme"]>;
}): Promise<Course> {
  return request("/api/courses", { method: "POST", body: JSON.stringify(input) });
}

export function patchCourse(
  courseId: string,
  patch: { title?: string; description?: string; category?: string; theme?: Partial<Course["theme"]> }
): Promise<Course> {
  return request(`/api/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(patch) });
}

// Permanent - cannot be undone. The course's modules aren't deleted with it:
// each becomes an unassigned library entry (or is dropped if it had no
// lessons yet), so they need to be added to a new course to be used again.
export async function deleteCourse(courseId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/courses/${courseId}`, { method: "DELETE", credentials: "include" });
}

// Uploads a Rise 360 .zip export, which the server decompiles into a new
// course + its modules/lessons. `category` is optional - left blank, the
// course is created uncategorized like any other.
export async function importRiseCourse(
  file: File,
  category?: string
): Promise<{ course: Course; moduleCount: number; skipped: { type: string; family?: string; variant?: string }[] }> {
  const formData = new FormData();
  formData.append("file", file);
  if (category) formData.append("category", category);
  const res = await fetch(`${API_BASE_URL}/api/courses/import/rise`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : `Request failed: ${res.status}`);
  }
  return res.json();
}

export function listModulesByCourse(courseId: string): Promise<Module[]> {
  return request(`/api/courses/${courseId}/modules`);
}

export function listAllModules(): Promise<Module[]> {
  return request("/api/modules");
}

export function getModule(moduleId: string): Promise<Module> {
  return request(`/api/modules/${moduleId}`);
}

export function createModule(input: {
  courseId?: string;
  category?: string;
  title: string;
  objective: string;
  lessons?: Lesson[];
}): Promise<Module> {
  return request("/api/modules", { method: "POST", body: JSON.stringify(input) });
}

export function saveModule(moduleId: string, module: Module): Promise<Module> {
  return request(`/api/modules/${moduleId}`, { method: "PUT", body: JSON.stringify(module) });
}

// Removes a module from its course, turning it into a reusable library entry.
// A module with no lessons yet is deleted outright instead (returns null) -
// see server/src/store.ts's unassignModule for why.
export async function unassignModule(moduleId: string): Promise<Module | null> {
  const res = await fetch(`${API_BASE_URL}/api/modules/${moduleId}/unassign`, {
    method: "PATCH",
    credentials: "include",
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function deleteModule(moduleId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/api/modules/${moduleId}`, { method: "DELETE", credentials: "include" });
}

export function listLearningPaths(): Promise<LearningPath[]> {
  return request("/api/learning-paths");
}

export function getLearningPath(pathId: string): Promise<LearningPath> {
  return request(`/api/learning-paths/${pathId}`);
}

export function createLearningPath(input: {
  title: string;
  description?: string;
  courseIds?: string[];
}): Promise<LearningPath> {
  return request("/api/learning-paths", { method: "POST", body: JSON.stringify(input) });
}

export function patchLearningPath(
  pathId: string,
  patch: { title?: string; description?: string; courseIds?: string[] }
): Promise<LearningPath> {
  return request(`/api/learning-paths/${pathId}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function getProgress(): Promise<{ completedLessonIds: string[] }> {
  return request("/api/progress");
}

export function setLessonProgress(lessonId: string, completed: boolean): Promise<{ completedLessonIds: string[] }> {
  return request(`/api/progress/lessons/${lessonId}`, { method: "PUT", body: JSON.stringify({ completed }) });
}

export function getPreferences(): Promise<{
  lessonDisplayMode: LessonDisplayMode | null;
  colorScheme: ColorScheme | null;
}> {
  return request("/api/preferences");
}

export function setPreferences(lessonDisplayMode: LessonDisplayMode): Promise<{ lessonDisplayMode: LessonDisplayMode }> {
  return request("/api/preferences", { method: "PUT", body: JSON.stringify({ lessonDisplayMode }) });
}

export function setColorScheme(colorScheme: ColorScheme): Promise<{ colorScheme: ColorScheme }> {
  return request("/api/preferences/color-scheme", { method: "PUT", body: JSON.stringify({ colorScheme }) });
}
