import type { Lesson, LessonType, WordingStyle } from "../types.js";
import { EXISTING_LESSON_MIME, LIBRARY_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { lessonTypeLabel } from "../lessonTemplates.js";
import { LessonEditorForm } from "./LessonEditorForm.js";
import { LessonRenderer } from "./LessonRenderer.js";

export function DraggableLessonBlock({
  lesson,
  isEditing,
  onSwapBlank,
  onSwapSaved,
  onSwapLibrary,
  onRemove,
  onToggleEdit,
  onContentChange,
  onWordingStyleChange,
  onTitleChange,
}: {
  lesson: Lesson;
  isEditing: boolean;
  onSwapBlank: (targetId: string, newType: LessonType) => void;
  onSwapSaved: (targetId: string, savedLessonId: string) => void;
  onSwapLibrary: (targetId: string, lesson: Lesson) => void;
  onRemove: (lessonId: string) => void;
  onToggleEdit: (lessonId: string) => void;
  onContentChange: (lessonId: string, content: Lesson["content"]) => void;
  onWordingStyleChange: (lessonId: string, wordingStyle: WordingStyle) => void;
  onTitleChange: (lessonId: string, title: string) => void;
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
        // Repositioning an existing lesson (a drag from elsewhere in this
        // list) is handled by the LessonGap targets between/around blocks,
        // not by dropping directly on a block - "insert before whichever
        // block you happened to drop on" is exactly the ambiguous, direction-
        // dependent gesture that made moving a lesson down feel broken (see
        // lessonListOrdering.ts). Dropping a NEW/saved/library block
        // directly on a block still swaps it, same as always.
        const newType = e.dataTransfer.getData(NEW_LESSON_MIME) as LessonType | "";
        const savedId = e.dataTransfer.getData(SAVED_LESSON_MIME);
        const libraryJson = e.dataTransfer.getData(LIBRARY_LESSON_MIME);
        if (newType) onSwapBlank(lesson.lessonId, newType);
        else if (savedId) onSwapSaved(lesson.lessonId, savedId);
        else if (libraryJson) onSwapLibrary(lesson.lessonId, JSON.parse(libraryJson) as Lesson);
      }}
    >
      <div className="admin-lesson-toolbar">
        <span className="admin-lesson-toolbar-info">
          <span className="admin-lesson-title">{lesson.title}</span>
          <span className="admin-lesson-type-badge">{lessonTypeLabel(lesson.type)}</span>
          <span aria-hidden="true">
            {lesson.type === "examBreakdown"
              ? "⠿ drag to move - required, can't be removed or swapped out"
              : "⠿ drag to move or drop a library block here to swap"}
          </span>
        </span>
        <div className="admin-lesson-actions">
          <button type="button" onClick={() => onToggleEdit(lesson.lessonId)}>
            {isEditing ? "Done" : "Edit"}
          </button>
          {lesson.type !== "examBreakdown" && (
            <button type="button" onClick={() => onRemove(lesson.lessonId)}>
              Remove
            </button>
          )}
        </div>
      </div>
      {isEditing ? (
        <div className="lesson-editor">
          <label className="field">
            Title
            <input value={lesson.title} onChange={(e) => onTitleChange(lesson.lessonId, e.target.value)} required />
          </label>
          {lesson.type === "text" && (
            <label className="field wording-style-field">
              Wording style
              <select
                value={lesson.wordingStyle}
                onChange={(e) => onWordingStyleChange(lesson.lessonId, e.target.value as WordingStyle)}
              >
                <option value="official">Official</option>
                <option value="shortened">Shortened (non-official)</option>
              </select>
            </label>
          )}
          <LessonEditorForm lesson={lesson} onChange={(content) => onContentChange(lesson.lessonId, content)} />
        </div>
      ) : (
        <LessonRenderer lesson={lesson} />
      )}
    </div>
  );
}
