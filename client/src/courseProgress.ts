import type { Module } from "./types.js";

export function isModuleComplete(module: Module, completedIds: Set<string>): boolean {
  return module.lessons.length > 0 && module.lessons.every((l) => completedIds.has(l.lessonId));
}

// Modules unlock in order - a module is reachable once every module before
// it is complete (or it's already complete itself, so finishing it once
// doesn't re-lock it if a later requirement regresses somehow).
export function isModuleLocked(modules: Module[], index: number, completedIds: Set<string>): boolean {
  if (isModuleComplete(modules[index], completedIds)) return false;
  return !modules.slice(0, index).every((m) => isModuleComplete(m, completedIds));
}
