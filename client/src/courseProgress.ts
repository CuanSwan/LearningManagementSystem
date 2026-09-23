import type { Module, UserRole } from "./types.js";

export function isModuleComplete(module: Module, completedIds: Set<string>): boolean {
  return module.lessons.length > 0 && module.lessons.every((l) => completedIds.has(l.lessonId));
}

// Modules unlock in order - a module is reachable once every module before
// it is complete (or it's already complete itself, so finishing it once
// doesn't re-lock it if a later requirement regresses somehow). An
// admin/super_admin never hits this at all - same bypass as
// isCourseAccessible in access.ts - so they can click straight through
// every module while reviewing content or checking layout, without having
// to mark lessons complete first.
export function isModuleLocked(modules: Module[], index: number, completedIds: Set<string>, role: UserRole): boolean {
  if (role === "admin" || role === "super_admin") return false;
  if (isModuleComplete(modules[index], completedIds)) return false;
  return !modules.slice(0, index).every((m) => isModuleComplete(m, completedIds));
}
