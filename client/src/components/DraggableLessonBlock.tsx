import type { Lesson, LessonType } from "@lms/shared";
import { EXISTING_LESSON_MIME, NEW_LESSON_MIME } from "../dnd.js";
import { LessonRenderer } from "./LessonRenderer.js";

export function DraggableLessonBlock({
  lesson,
  onReorder,
  onSwap,
  onRemove,
}: {
  lesson: Lesson;
  onReorder: (draggedId: string, targetId: string) => void;
  onSwap: (targetId: string, newType: LessonType) => void;
  onRemove: (lessonId: string) => void;
}) {
  return (
    <div
      className="admin-lesson-wrapper"
      draggable
      onDragStart={(e) => e.dataTransfer.setData(EXISTING_LESSON_MIME, lesson.lessonId)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const newType = e.dataTransfer.getData(NEW_LESSON_MIME) as LessonType | "";
        const draggedId = e.dataTransfer.getData(EXISTING_LESSON_MIME);
        if (newType) {
          onSwap(lesson.lessonId, newType);
        } else if (draggedId && draggedId !== lesson.lessonId) {
          onReorder(draggedId, lesson.lessonId);
        }
      }}
    >
      <div className="admin-lesson-toolbar">
        <span aria-hidden="true">⠿ drag to move or drop a library block here to swap</span>
        <button type="button" onClick={() => onRemove(lesson.lessonId)}>
          Remove
        </button>
      </div>
      <LessonRenderer lesson={lesson} />
    </div>
  );
}
