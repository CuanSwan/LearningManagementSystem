import type { Lesson, LessonType } from "./types.js";

export const LESSON_TYPES: LessonType[] = [
  "text",
  "video",
  "quiz",
  "practical",
  "diagram",
  "flashcard",
  "accordion",
  "matching",
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
};

export function lessonTypeLabel(type: LessonType): string {
  return LESSON_TYPE_LABELS[type];
}

export function describeLesson(lesson: Lesson): string {
  switch (lesson.type) {
    case "text":
      return lesson.content.body || "(empty)";
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
  }
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
  }
}
