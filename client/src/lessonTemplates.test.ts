// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { describeLesson } from "./lessonTemplates.js";
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
});
