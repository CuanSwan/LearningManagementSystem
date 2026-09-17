import { describe, expect, it } from "vitest";
import { createBlankLesson, describeLesson } from "./lessonTemplates.js";
import type { Lesson } from "./types.js";

const base = { lessonId: "l1", schemaVersion: 1, source: "human" as const, wordingStyle: "official" as const, order: 1 };

describe("describeLesson", () => {
  it("summarizes an exam breakdown lesson's structured fields", () => {
    const lesson: Lesson = {
      ...base,
      type: "examBreakdown",
      content: { passMarkPercent: 70, timeLimitMinutes: 90, questionCount: 40, openBook: false },
    };
    expect(describeLesson(lesson)).toBe("40 questions, 90 min, 70% to pass, closed book");
  });

  it("reflects an open-book exam breakdown", () => {
    const lesson: Lesson = {
      ...base,
      type: "examBreakdown",
      content: { passMarkPercent: 50, timeLimitMinutes: 60, questionCount: 20, openBook: true },
    };
    expect(describeLesson(lesson)).toBe("20 questions, 60 min, 50% to pass, open book");
  });
});

describe("createBlankLesson", () => {
  it("creates an exam breakdown lesson with sensible closed-book defaults", () => {
    const lesson = createBlankLesson("examBreakdown", 1);
    expect(lesson.type).toBe("examBreakdown");
    expect(lesson.content).toEqual({
      passMarkPercent: 50,
      timeLimitMinutes: 60,
      questionCount: 20,
      openBook: false,
    });
  });
});
