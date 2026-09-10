import type { Lesson, LessonType } from "@lms/shared";

export const LESSON_TYPES: LessonType[] = ["text", "video", "quiz", "practical"];

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  text: "Text",
  video: "Video",
  quiz: "Quiz",
  practical: "Practical",
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
  }
}
