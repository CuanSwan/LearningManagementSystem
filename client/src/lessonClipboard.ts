import { useSyncExternalStore } from "react";
import type { Lesson } from "./types.js";

// A small cross-page clipboard for moving a lesson to a different module -
// pulling a lesson out of one module's editor stages it here instead of
// writing anything to the server (see useLessonListEditor.ts's
// moveToClipboard), the same way swapping/removing a lesson already stages
// the displaced one in that module's own local "saved lessons" - the
// difference is this one is shared across every module editor page instead
// of scoped to a single `useLessonListEditor` instance, since the whole
// point is picking it up again after navigating to a different module.
// A plain module-level store (not React state) is enough for that: this SPA
// never fully reloads between admin pages, so it survives navigation
// without needing localStorage or a context provider - and, like every
// other unsaved draft edit in these editors, it's gone on an actual page
// reload rather than silently persisting across a browser session.
let clipboard: Lesson[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function addToLessonClipboard(lesson: Lesson) {
  clipboard = [...clipboard, lesson];
  emit();
}

export function removeFromLessonClipboard(lessonId: string) {
  clipboard = clipboard.filter((l) => l.lessonId !== lessonId);
  emit();
}

export function getLessonClipboard(): Lesson[] {
  return clipboard;
}

export function useLessonClipboard(): Lesson[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getLessonClipboard
  );
}
