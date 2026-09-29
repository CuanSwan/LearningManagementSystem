import { describe, expect, it } from "vitest";
import { insertLesson, moveLesson } from "./lessonListOrdering.js";
import type { Lesson } from "./types.js";

function textLesson(lessonId: string, order: number): Lesson {
  return { lessonId, schemaVersion: 1, source: "human", wordingStyle: "official", order, type: "text", content: { body: lessonId } };
}

function ids(lessons: Lesson[]): string[] {
  return lessons.map((l) => l.lessonId);
}

describe("moveLesson", () => {
  const abcd = [textLesson("A", 1), textLesson("B", 2), textLesson("C", 3), textLesson("D", 4)];

  it("moves a lesson later in the list, before the given target", () => {
    expect(ids(moveLesson(abcd, "A", "D"))).toEqual(["B", "C", "A", "D"]);
  });

  it("moves a lesson earlier in the list, before the given target", () => {
    expect(ids(moveLesson(abcd, "D", "B"))).toEqual(["A", "D", "B", "C"]);
  });

  it("moves a lesson to the very end when beforeId is null", () => {
    expect(ids(moveLesson(abcd, "A", null))).toEqual(["B", "C", "D", "A"]);
  });

  it("moves a lesson to the very start when beforeId is the current first lesson", () => {
    expect(ids(moveLesson(abcd, "D", "A"))).toEqual(["D", "A", "B", "C"]);
  });

  // "Insert A before B" is genuinely a no-op when B is the only other
  // lesson - removing A and reinserting it right before an unmoved B just
  // recreates the same order. This is exactly why the UI needs a distinct
  // "after the last lesson" target (beforeId: null) rather than only ever
  // being able to target an existing lesson's own id: that's the only way
  // to express "swap these two, moving the earlier one down."
  it("targeting the very next lesson downward is a no-op - moving down past it needs beforeId: null instead", () => {
    const ab = [textLesson("A", 1), textLesson("B", 2)];
    expect(ids(moveLesson(ab, "A", "B"))).toEqual(["A", "B"]);
    expect(ids(moveLesson(ab, "A", null))).toEqual(["B", "A"]);
  });

  it("swaps two adjacent lessons when dragging the later one onto the earlier one (upward)", () => {
    const ab = [textLesson("A", 1), textLesson("B", 2)];
    expect(ids(moveLesson(ab, "B", "A"))).toEqual(["B", "A"]);
  });

  it("renumbers order to match the new positions", () => {
    const result = moveLesson(abcd, "A", "D");
    expect(result.map((l) => l.order)).toEqual([1, 2, 3, 4]);
  });

  it("is a no-op if the dragged lesson isn't in the list", () => {
    expect(moveLesson(abcd, "not-here", "B")).toBe(abcd);
  });

  it("is a no-op if beforeId doesn't match anything in the list", () => {
    expect(moveLesson(abcd, "A", "not-here")).toBe(abcd);
  });
});

describe("insertLesson", () => {
  const abc = [textLesson("A", 1), textLesson("B", 2), textLesson("C", 3)];

  it("inserts a new lesson between two existing lessons, displacing neither", () => {
    const result = insertLesson(abc, textLesson("NEW", 0), "B");
    expect(ids(result)).toEqual(["A", "NEW", "B", "C"]);
  });

  it("inserts a new lesson at the very start", () => {
    expect(ids(insertLesson(abc, textLesson("NEW", 0), "A"))).toEqual(["NEW", "A", "B", "C"]);
  });

  it("inserts a new lesson at the very end when beforeId is null", () => {
    expect(ids(insertLesson(abc, textLesson("NEW", 0), null))).toEqual(["A", "B", "C", "NEW"]);
  });

  it("inserts into an empty list", () => {
    expect(ids(insertLesson([], textLesson("NEW", 0), null))).toEqual(["NEW"]);
  });

  it("renumbers order to match the new positions", () => {
    const result = insertLesson(abc, textLesson("NEW", 0), "B");
    expect(result.map((l) => l.order)).toEqual([1, 2, 3, 4]);
  });

  it("falls back to the end if beforeId doesn't match anything in the list", () => {
    expect(ids(insertLesson(abc, textLesson("NEW", 0), "not-here"))).toEqual(["A", "B", "C", "NEW"]);
  });
});
