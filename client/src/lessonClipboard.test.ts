import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lesson } from "./types.js";

function textLesson(lessonId: string): Lesson {
  return {
    lessonId,
    schemaVersion: 1,
    source: "human",
    wordingStyle: "official",
    order: 1,
    title: "A lesson",
    type: "text",
    content: { body: "x" },
  };
}

// Each test re-imports the module fresh (it holds module-level state, not
// React state) so one test's clipboard contents can't leak into another's.
describe("lessonClipboard", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("starts empty", async () => {
    const { getLessonClipboard } = await import("./lessonClipboard.js");
    expect(getLessonClipboard()).toEqual([]);
  });

  it("adds a lesson, keeping its own lessonId and content", async () => {
    const { addToLessonClipboard, getLessonClipboard } = await import("./lessonClipboard.js");
    const lesson = textLesson("l1");
    addToLessonClipboard(lesson);
    expect(getLessonClipboard()).toEqual([lesson]);
  });

  it("appends rather than replacing - more than one lesson can be staged at once", async () => {
    const { addToLessonClipboard, getLessonClipboard } = await import("./lessonClipboard.js");
    addToLessonClipboard(textLesson("l1"));
    addToLessonClipboard(textLesson("l2"));
    expect(getLessonClipboard().map((l) => l.lessonId)).toEqual(["l1", "l2"]);
  });

  it("removes a lesson by id, leaving the rest untouched", async () => {
    const { addToLessonClipboard, removeFromLessonClipboard, getLessonClipboard } = await import("./lessonClipboard.js");
    addToLessonClipboard(textLesson("l1"));
    addToLessonClipboard(textLesson("l2"));
    removeFromLessonClipboard("l1");
    expect(getLessonClipboard().map((l) => l.lessonId)).toEqual(["l2"]);
  });

  it("removing an id that isn't on the clipboard is a harmless no-op", async () => {
    const { addToLessonClipboard, removeFromLessonClipboard, getLessonClipboard } = await import("./lessonClipboard.js");
    addToLessonClipboard(textLesson("l1"));
    removeFromLessonClipboard("no-such-id");
    expect(getLessonClipboard().map((l) => l.lessonId)).toEqual(["l1"]);
  });
});
