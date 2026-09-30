import { useState } from "react";
import type { Lesson, LessonType, WordingStyle } from "./types.js";
import { generateId } from "./id.js";
import { insertLesson, moveLesson } from "./lessonListOrdering.js";
import { createBlankLesson } from "./lessonTemplates.js";

// Shared drag/reorder/swap/remove logic for a module's lesson list, used by
// both the module editor (an existing, persisted module) and the new-module
// draft flow (nothing persisted yet) - the two only differ in what happens
// on save, not in how the list itself gets edited.
export function useLessonListEditor(initial: Lesson[] = []) {
  const [lessons, setLessons] = useState<Lesson[]>([...initial].sort((a, b) => a.order - b.order));
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);

  function reset(next: Lesson[]) {
    setLessons([...next].sort((a, b) => a.order - b.order));
    setSavedLessons([]);
  }

  // Repositions an existing lesson to sit immediately before `beforeId`, or
  // at the very end if `beforeId` is null - see lessonListOrdering.ts for
  // why the caller needs both a per-lesson target AND a distinct
  // end-of-list one, rather than only ever being able to target an
  // existing lesson's own id.
  function move(draggedId: string, beforeId: string | null) {
    setLessons((prev) => moveLesson(prev, draggedId, beforeId));
  }

  function swapBlank(targetId: string, newType: LessonType) {
    const displaced = lessons.find((l) => l.lessonId === targetId);
    if (!displaced || displaced.type === "examBreakdown") return;
    const blank = createBlankLesson(newType, displaced.order);
    setLessons((prev) => prev.map((l) => (l.lessonId === targetId ? blank : l)));
    setSavedLessons((prev) => [...prev, displaced]);
  }

  function swapSaved(targetId: string, savedLessonId: string) {
    const saved = savedLessons.find((l) => l.lessonId === savedLessonId);
    const displaced = lessons.find((l) => l.lessonId === targetId);
    if (!saved || !displaced || displaced.type === "examBreakdown") return;
    const restored = { ...saved, order: displaced.order };
    setLessons((prev) => prev.map((l) => (l.lessonId === targetId ? restored : l)));
    setSavedLessons((prev) => [...prev.filter((l) => l.lessonId !== savedLessonId), displaced]);
  }

  function swapLibrary(targetId: string, libraryLesson: Lesson) {
    if (libraryLesson.type === "examBreakdown") return;
    const displaced = lessons.find((l) => l.lessonId === targetId);
    if (!displaced || displaced.type === "examBreakdown") return;
    const copy = { ...libraryLesson, lessonId: generateId(), order: displaced.order } as Lesson;
    setLessons((prev) => prev.map((l) => (l.lessonId === targetId ? copy : l)));
    setSavedLessons((prev) => [...prev, displaced]);
  }

  // Exam breakdown is a permanent fixture of the module it's created in
  // (the Course Orientation module) - it must always exist, so removing or
  // swapping it out (above) is refused rather than silently allowed.
  function remove(lessonId: string) {
    const removed = lessons.find((l) => l.lessonId === lessonId);
    if (!removed || removed.type === "examBreakdown") return;
    setLessons((prev) => prev.filter((l) => l.lessonId !== lessonId).map((l, i) => ({ ...l, order: i + 1 })));
    setSavedLessons((prev) => [...prev, removed]);
  }

  // Adds a brand-new blank lesson positioned immediately before `beforeId`
  // (or at the end, if null) - unlike swapBlank above, this never displaces
  // an existing lesson.
  function insertBlank(type: LessonType, beforeId: string | null) {
    setLessons((prev) => insertLesson(prev, createBlankLesson(type, prev.length + 1), beforeId));
  }

  function insertSaved(savedLessonId: string, beforeId: string | null) {
    const saved = savedLessons.find((l) => l.lessonId === savedLessonId);
    if (!saved) return;
    setLessons((prev) => insertLesson(prev, saved, beforeId));
    setSavedLessons((prev) => prev.filter((l) => l.lessonId !== savedLessonId));
  }

  // Reused from another module's library entry via drag - exam breakdown is
  // excluded here too, for the same reason it's excluded from the component
  // palette: it's a fixture of the module it was created in, not something
  // to duplicate into others.
  function insertLibrary(libraryLesson: Lesson, beforeId: string | null) {
    if (libraryLesson.type === "examBreakdown") return;
    setLessons((prev) => insertLesson(prev, { ...libraryLesson, lessonId: generateId() } as Lesson, beforeId));
  }

  function importLesson(lesson: Lesson) {
    setSavedLessons((prev) => [...prev, lesson]);
  }

  function updateContent(lessonId: string, content: Lesson["content"]) {
    setLessons((prev) =>
      // The editor form only ever produces a content shape matching the lesson's
      // own type, but TypeScript can't correlate that through the union - assert it.
      prev.map((l) => (l.lessonId === lessonId ? ({ ...l, content } as Lesson) : l))
    );
  }

  function updateWordingStyle(lessonId: string, wordingStyle: WordingStyle) {
    setLessons((prev) => prev.map((l) => (l.lessonId === lessonId ? { ...l, wordingStyle } : l)));
  }

  function updateTitle(lessonId: string, title: string) {
    setLessons((prev) => prev.map((l) => (l.lessonId === lessonId ? { ...l, title } : l)));
  }

  return {
    lessons,
    savedLessons,
    reset,
    move,
    swapBlank,
    swapSaved,
    swapLibrary,
    remove,
    insertBlank,
    insertSaved,
    insertLibrary,
    importLesson,
    updateContent,
    updateWordingStyle,
    updateTitle,
  };
}
