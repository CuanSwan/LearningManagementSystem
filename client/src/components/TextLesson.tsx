import type { TextLesson as TextLessonType } from "@lms/shared";

export function TextLesson({ content }: { content: TextLessonType["content"] }) {
  return <p>{content.body}</p>;
}
