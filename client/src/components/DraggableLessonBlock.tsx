import type { Lesson, LessonType } from "@lms/shared";
import { EXISTING_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { LessonEditorForm } from "./LessonEditorForm.js";
import { LessonRenderer } from "./LessonRenderer.js";

export function DraggableLessonBlock({
  lesson,
  isEditing,
  onReorder,
  onSwapBlank,
  onSwapSaved,
  onRemove,
  onToggleEdit,
  onContentChange,
}: {
  lesson: Lesson;
  isEditing: boolean;
  onReorder: (draggedId: string, targetId: string) => void;
  onSwapBlank: (targetId: string, newType: LessonType) => void;
  onSwapSaved: (targetId: string, savedLessonId: string) => void;
  onRemove: (lessonId: string) => void;
  onToggleEdit: (lessonId: string) => void;
  onContentChange: (lessonId: string, content: Lesson["content"]) => void;
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
        const savedId = e.dataTransfer.getData(SAVED_LESSON_MIME);
        const draggedId = e.dataTransfer.getData(EXISTING_LESSON_MIME);
        if (newType) onSwapBlank(lesson.lessonId, newType);
        else if (savedId) onSwapSaved(lesson.lessonId, savedId);
        else if (draggedId && draggedId !== lesson.lessonId) onReorder(draggedId, lesson.lessonId);
      }}
    >
      <div className="admin-lesson-toolbar">
        <span aria-hidden="true">⠿ drag to move or drop a library block here to swap</span>
        <div className="admin-lesson-actions">
          <button type="button" onClick={() => onToggleEdit(lesson.lessonId)}>
            {isEditing ? "Done" : "Edit"}
          </button>
          <button type="button" onClick={() => onRemove(lesson.lessonId)}>
            Remove
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="lesson-editor">
          <LessonEditorForm lesson={lesson} onChange={(content) => onContentChange(lesson.lessonId, content)} />
        </div>
      ) : (
        <LessonRenderer lesson={lesson} />
      )}
    </div>
  );
}
