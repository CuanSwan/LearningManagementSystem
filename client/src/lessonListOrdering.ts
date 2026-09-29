import type { Lesson } from "./types.js";

// `order` is 1-based and must stay dense/gapless, matching each lesson's
// actual position in the array - every function below needs this after
// rearranging anything.
function renumbered(lessons: Lesson[]): Lesson[] {
  return lessons.map((lesson, i) => ({ ...lesson, order: i + 1 }));
}

// Resolves `beforeId` to an index within `lessons` - null means "the end
// of the list." Returns null (not 0) if beforeId doesn't match anything
// currently in the list, so a caller can tell "insert at the start" apart
// from "this target no longer exists."
function resolveIndex(lessons: Lesson[], beforeId: string | null): number | null {
  if (beforeId === null) return lessons.length;
  const index = lessons.findIndex((lesson) => lesson.lessonId === beforeId);
  return index === -1 ? null : index;
}

// Repositions an existing lesson to sit immediately before `beforeId` (or
// at the very end, if `beforeId` is null). The target index is always
// resolved against the list with the dragged lesson already removed, which
// is what makes this symmetric in both directions - naively resolving the
// target position against the ORIGINAL list (before removing the dragged
// lesson) silently no-ops for a downward move onto the dragged lesson's
// own immediate successor: removing the dragged lesson and reinserting it
// right before a neighbor that never moved just recreates the same order.
export function moveLesson(lessons: Lesson[], draggedId: string, beforeId: string | null): Lesson[] {
  const dragged = lessons.find((lesson) => lesson.lessonId === draggedId);
  if (!dragged) return lessons;
  const without = lessons.filter((lesson) => lesson.lessonId !== draggedId);
  const index = resolveIndex(without, beforeId);
  if (index === null) return lessons;
  without.splice(index, 0, dragged);
  return renumbered(without);
}

// Inserts a lesson that isn't already part of this list, immediately
// before `beforeId` (or at the end, if `beforeId` is null) - unlike a
// swap, nothing already in the list is displaced or removed.
export function insertLesson(lessons: Lesson[], newLesson: Lesson, beforeId: string | null): Lesson[] {
  const index = resolveIndex(lessons, beforeId) ?? lessons.length;
  const next = [...lessons];
  next.splice(index, 0, newLesson);
  return renumbered(next);
}
