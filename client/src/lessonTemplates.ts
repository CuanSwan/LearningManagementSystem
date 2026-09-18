import DOMPurify from "dompurify";
import type { Lesson, LessonType, Module } from "./types.js";

// Exam breakdown is deliberately excluded here - it's not a general-purpose
// block an admin can drag into any module. It's a permanent fixture of the
// Course Orientation module (see createOrientationModule in the server's
// store.ts), never freely addable elsewhere.
export const LESSON_TYPES: LessonType[] = [
  "text",
  "video",
  "quiz",
  "practical",
  "diagram",
  "flashcard",
  "accordion",
  "matching",
  "html",
  "embed",
];

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  text: "Text",
  video: "Video",
  quiz: "Quiz",
  practical: "Practical",
  diagram: "Diagram",
  flashcard: "Flashcards",
  accordion: "Accordion",
  matching: "Matching",
  html: "Custom HTML",
  embed: "Embed (iframe)",
  examBreakdown: "Exam Breakdown",
};

export function lessonTypeLabel(type: LessonType): string {
  return LESSON_TYPE_LABELS[type];
}

// Both "text" and "html" lesson bodies are markup, not plain text - a
// preview showing raw tags ("<h2>Study Plan</h2><p>...") instead of
// readable text is worse than useless. DOMPurify with an empty allow-list
// strips every tag safely (no XSS-prone regex) and leaves just the text.
function textPreview(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
}

export function describeLesson(lesson: Lesson): string {
  switch (lesson.type) {
    case "text":
      return textPreview(lesson.content.body) || "(empty)";
    case "video":
      return lesson.content.videoUrl || "(empty)";
    case "quiz":
      return lesson.content.questions[0]?.prompt || "(empty)";
    case "practical":
      return lesson.content.instructions || "(empty)";
    case "diagram":
      return lesson.content.imageUrl || "(empty)";
    case "flashcard":
      return lesson.content.cards[0]?.front || "(empty)";
    case "accordion":
      return lesson.content.sections[0]?.title || "(empty)";
    case "matching":
      return lesson.content.pairs[0]?.prompt || "(empty)";
    case "html":
      return textPreview(lesson.content.html) || "(empty)";
    case "embed":
      return lesson.content.url || "(empty)";
    case "examBreakdown": {
      const { questionCount, timeLimitMinutes, passMarkPercent, openBook } = lesson.content;
      return `${questionCount} questions, ${timeLimitMinutes} min, ${passMarkPercent}% to pass, ${openBook ? "open book" : "closed book"}`;
    }
  }
}

// A lesson has no name of its own in the schema - just content. This is a
// display-only label (never persisted) for contexts where a lesson needs to
// be identified on its own, detached from the module list it normally sits
// in (e.g. the unassigned library tree).
export function moduleLessonLabel(module: Module, lesson: Lesson): string {
  return `${module.seed.title} — Lesson ${lesson.order}`;
}

export function createBlankLesson(type: LessonType, order: number): Lesson {
  const base = {
    lessonId: crypto.randomUUID(),
    schemaVersion: 1,
    source: "human" as const,
    wordingStyle: "shortened" as const,
    order,
  };
  switch (type) {
    case "text":
      return { ...base, type, content: { body: "" } };
    case "video":
      return { ...base, type, content: { videoUrl: "" } };
    case "quiz":
      return {
        ...base,
        type,
        content: { questions: [{ prompt: "", options: ["", ""], correctIndex: 0 }] },
      };
    case "practical":
      return { ...base, type, content: { instructions: "", steps: [], submissionType: "text" } };
    case "diagram":
      return { ...base, type, content: { imageUrl: "" } };
    case "flashcard":
      return { ...base, type, content: { cards: [{ front: "", back: "" }] } };
    case "accordion":
      return { ...base, type, content: { sections: [{ title: "", body: "" }] } };
    case "matching":
      return { ...base, type, content: { pairs: [{ prompt: "", match: "" }, { prompt: "", match: "" }] } };
    case "html":
      return { ...base, type, content: { html: "" } };
    case "embed":
      return { ...base, type, content: { url: "" } };
    case "examBreakdown":
      return {
        ...base,
        type,
        content: { passMarkPercent: 50, timeLimitMinutes: 60, questionCount: 20, openBook: false },
      };
  }
}
