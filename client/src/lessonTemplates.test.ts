// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createBlankLesson, describeLesson } from "./lessonTemplates.js";
import type { Lesson } from "./types.js";

const base = { lessonId: "l1", schemaVersion: 1, source: "human" as const, wordingStyle: "official" as const, order: 1 };

describe("describeLesson", () => {
  it("strips markup from a text lesson's body down to readable text", () => {
    const lesson: Lesson = {
      ...base,
      type: "text",
      content: { body: "<h2>Study Plan</h2><p>This course runs over 4 weeks.</p>" },
    };
    expect(describeLesson(lesson)).toBe("Study PlanThis course runs over 4 weeks.");
  });

  it("strips markup from a custom-html lesson the same way", () => {
    const lesson: Lesson = {
      ...base,
      type: "html",
      content: { html: "<strong>Bold</strong> and <em>italic</em>" },
    };
    expect(describeLesson(lesson)).toBe("Bold and italic");
  });

  it("falls back to (empty) once tags are stripped from a body that was only markup", () => {
    const lesson: Lesson = { ...base, type: "text", content: { body: "<p></p>" } };
    expect(describeLesson(lesson)).toBe("(empty)");
  });

  it("leaves a plain-text (pre-markup-editor) body untouched", () => {
    const lesson: Lesson = { ...base, type: "text", content: { body: "Every project moves through five phases." } };
    expect(describeLesson(lesson)).toBe("Every project moves through five phases.");
  });

  it("doesn't touch a video lesson's URL, which was never markup", () => {
    const lesson: Lesson = { ...base, type: "video", content: { videoUrl: "https://example.com/video.mp4" } };
    expect(describeLesson(lesson)).toBe("https://example.com/video.mp4");
  });

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
