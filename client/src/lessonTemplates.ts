import DOMPurify from "dompurify";
import { generateId } from "./id.js";
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
  "dial",
  "pipeline",
  "presentationDial",
  "cardGrid",
  "hotspots",
  "treeScrub",
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
  dial: "Dial",
  pipeline: "Pipeline Stages",
  presentationDial: "Presentation Dial",
  cardGrid: "Card Grid",
  hotspots: "Hotspot Grid",
  treeScrub: "Scroll Tree",
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
    case "dial":
      return lesson.content.stages[0]?.title || "(empty)";
    case "pipeline":
      return lesson.content.steps[0]?.title || "(empty)";
    case "presentationDial":
      return lesson.content.stages[0]?.title || "(empty)";
    case "cardGrid":
      return lesson.content.cards[0]?.title || "(empty)";
    case "hotspots":
      return lesson.content.tiles[0]?.title || "(empty)";
    case "treeScrub":
      return lesson.content.nodes[0]?.title || "(empty)";
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

// A generic placeholder graphic for the diagram preview below - a data URI
// so the hover preview never makes a network request for a real image.
const PLACEHOLDER_DIAGRAM_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%23e8e6de'/%3E%3Ccircle cx='120' cy='80' r='30' fill='%23c9c6ba'/%3E%3Cpath d='M0 200 L120 100 L200 180 L280 120 L400 200 L400 240 L0 240 Z' fill='%23d5d2c6'/%3E%3C/svg%3E";

// Illustrative, non-empty content for each lesson type, for the "hover to
// preview" popup in the component library - createBlankLesson's empty
// content renders as a wall of empty states, not a useful preview of what
// the block actually looks like. Never persisted, never shown to a student.
export function createPreviewLesson(type: LessonType): Lesson {
  const base = {
    lessonId: `preview-${type}`,
    schemaVersion: 1,
    source: "human" as const,
    wordingStyle: "shortened" as const,
    order: 1,
  };
  switch (type) {
    case "text":
      return { ...base, type, content: { body: "<h3>Key idea</h3><p>A short paragraph explaining the concept in plain language.</p>" } };
    case "video":
      // Left empty deliberately - VideoLesson's own empty state ("No video
      // has been added yet") is a real, representative render of the block
      // with zero network calls, rather than pointing it at a fake URL.
      return { ...base, type, content: { videoUrl: "" } };
    case "quiz":
      return {
        ...base,
        type,
        content: { questions: [{ prompt: "Which of these is a primary color?", options: ["Green", "Red", "Purple"], correctIndex: 1 }] },
      };
    case "practical":
      return {
        ...base,
        type,
        content: {
          instructions: "Complete the steps below and submit your work.",
          steps: ["Read the brief", "Draft your solution", "Submit for review"],
          submissionType: "text",
        },
      };
    case "diagram":
      return { ...base, type, content: { imageUrl: PLACEHOLDER_DIAGRAM_SVG } };
    case "flashcard":
      return { ...base, type, content: { cards: [{ front: "What does HTML stand for?", back: "HyperText Markup Language" }] } };
    case "accordion":
      return {
        ...base,
        type,
        content: {
          sections: [
            { title: "Section one", body: "Expandable details go here." },
            { title: "Section two", body: "More detail, collapsed by default." },
          ],
        },
      };
    case "matching":
      return {
        ...base,
        type,
        content: { pairs: [{ prompt: "Sun", match: "Star" }, { prompt: "Earth", match: "Planet" }] },
      };
    case "dial":
      return {
        ...base,
        type,
        content: {
          stages: [
            { title: "Plan", body: "Define the goal." },
            { title: "Build", body: "Create the thing." },
            { title: "Review", body: "Check the result." },
          ],
        },
      };
    case "pipeline":
      return {
        ...base,
        type,
        content: {
          steps: [
            { title: "Input", body: "Raw data arrives." },
            { title: "Process", body: "Transform it." },
            { title: "Output", body: "Deliver results." },
          ],
        },
      };
    case "presentationDial":
      return {
        ...base,
        type,
        content: {
          stages: [
            { title: "Plan", body: "Define the goal." },
            { title: "Build", body: "Create the thing." },
            { title: "Review", body: "Check the result." },
          ],
        },
      };
    case "cardGrid":
      return {
        ...base,
        type,
        content: {
          cards: [
            { title: "Option A", useWhen: "When X applies", looksLike: "Looks like Y", noteLabel: "Note", noteBody: "Extra detail." },
            { title: "Option B", useWhen: "When Z applies", looksLike: "Looks like W", noteLabel: "Note", noteBody: "Extra detail." },
          ],
        },
      };
    case "hotspots":
      return {
        ...base,
        type,
        content: {
          tiles: [
            { title: "Step 1", body: "Short body text.", example: "e.g. an example" },
            { title: "Step 2", body: "Short body text.", example: "e.g. another example" },
          ],
        },
      };
    case "treeScrub":
      return {
        ...base,
        type,
        content: {
          nodes: [
            { title: "Root", body: "", parentIndex: 0 },
            { title: "Branch", body: "", parentIndex: 0 },
          ],
        },
      };
    case "html":
      return { ...base, type, content: { html: "<p><strong>Custom</strong> HTML block.</p>" } };
    case "embed":
      // "about:blank" - never a real request, but still exercises the
      // actual iframe layout/chrome instead of skipping the embed entirely.
      return { ...base, type, content: { url: "about:blank" } };
    case "examBreakdown":
      return { ...base, type, content: { passMarkPercent: 70, timeLimitMinutes: 45, questionCount: 25, openBook: false } };
  }
}

export function createBlankLesson(type: LessonType, order: number): Lesson {
  const base = {
    lessonId: generateId(),
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
    case "dial":
      return { ...base, type, content: { stages: [{ title: "", body: "" }, { title: "", body: "" }] } };
    case "pipeline":
      return { ...base, type, content: { steps: [{ title: "", body: "" }, { title: "", body: "" }] } };
    case "presentationDial":
      return { ...base, type, content: { stages: [{ title: "", body: "" }, { title: "", body: "" }] } };
    case "cardGrid": {
      const blankCard = { title: "", useWhen: "", looksLike: "", noteLabel: "", noteBody: "" };
      return { ...base, type, content: { cards: [{ ...blankCard }, { ...blankCard }] } };
    }
    case "hotspots": {
      const blankTile = { title: "", body: "", example: "" };
      return { ...base, type, content: { tiles: [{ ...blankTile }, { ...blankTile }] } };
    }
    case "treeScrub":
      return {
        ...base,
        type,
        content: {
          nodes: [
            { title: "", body: "", parentIndex: 0 },
            { title: "", body: "", parentIndex: 0 },
          ],
        },
      };
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
