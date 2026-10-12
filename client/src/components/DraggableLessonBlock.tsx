import { useState } from "react";
import type { Lesson, LessonType, Module, WordingStyle } from "../types.js";
import { EXISTING_LESSON_MIME, LIBRARY_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { lessonTypeLabel } from "../lessonTemplates.js";
import { toTitleCase } from "../textCase.js";
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
  otherModules,
  onMoveLesson,
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
  otherModules?: Module[];
  onMoveLesson?: (lessonId: string, targetModuleId: string) => void;
}) {
  const [moveTarget, setMoveTarget] = useState("");
  const [moving, setMoving] = useState(false);
  const canMove = lesson.type !== "examBreakdown" && onMoveLesson && otherModules && otherModules.length > 0;

  async function handleMoveClick() {
    if (!moveTarget || !onMoveLesson) return;
    setMoving(true);
    try {
      await onMoveLesson(lesson.lessonId, moveTarget);
    } finally {
      setMoving(false);
      setMoveTarget("");
    }
  }
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
          <span className="admin-lesson-title">{toTitleCase(lesson.title)}</span>
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
      {canMove && (
        // Its own row, left-aligned, rather than crowding the toolbar's
        // right-aligned action buttons - those sit close enough to the
        // viewport's right edge, at common window widths, to land under the
        // floating admin tools panel (see .admin-tools-panel) and become
        // unclickable there.
        <div className="admin-lesson-move">
          <label className="sr-only" htmlFor={`move-${lesson.lessonId}`}>
            Move to module
          </label>
          <select
            id={`move-${lesson.lessonId}`}
            value={moveTarget}
            onChange={(e) => setMoveTarget(e.target.value)}
            disabled={moving}
          >
            <option value="">Move to module...</option>
            {otherModules!.map((m) => (
              <option key={m.moduleId} value={m.moduleId}>
                {m.seed.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleMoveClick} disabled={!moveTarget || moving}>
            {moving ? "Moving..." : "Move"}
          </button>
        </div>
      )}
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
