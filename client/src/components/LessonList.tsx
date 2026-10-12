import { Fragment } from "react";
import type { Module } from "../types.js";
import type { useLessonListEditor } from "../useLessonListEditor.js";
import { DraggableLessonBlock } from "./DraggableLessonBlock.js";
import { LessonGap } from "./LessonGap.js";

// Shared lesson-list rendering for the module editor and the new-module
// draft flow - a LessonGap before the first lesson, between every pair,
// and after the last, so a dragged-or-new block can land at any position
// without ever having to replace an existing lesson to get there (see
// lessonListOrdering.ts for the reorder semantics this depends on).
//
// otherModules/onMoveLesson are only passed for an already-persisted module
// (the new-module draft flow has no moduleId yet to move a lesson out of) -
// left undefined there, which just hides the "move to module" control.
export function LessonList({
  editor,
  editingId,
  onToggleEdit,
  otherModules,
  onMoveLesson,
}: {
  editor: ReturnType<typeof useLessonListEditor>;
  editingId: string | null;
  onToggleEdit: (lessonId: string) => void;
  otherModules?: Module[];
  onMoveLesson?: (lessonId: string, targetModuleId: string) => void;
}) {
  const { lessons } = editor;

  return (
    <div className="lesson-list">
      <LessonGap
        beforeId={lessons[0]?.lessonId ?? null}
        emptyLabel={lessons.length === 0 ? "Drop a library block here to add your first lesson" : undefined}
        onMove={editor.move}
        onInsertBlank={editor.insertBlank}
        onInsertSaved={editor.insertSaved}
        onInsertLibrary={editor.insertLibrary}
      />
      {lessons.map((lesson, i) => (
        <Fragment key={lesson.lessonId}>
          <DraggableLessonBlock
            lesson={lesson}
            isEditing={editingId === lesson.lessonId}
            onSwapBlank={editor.swapBlank}
            onSwapSaved={editor.swapSaved}
            onSwapLibrary={editor.swapLibrary}
            onRemove={editor.remove}
            onToggleEdit={onToggleEdit}
            onContentChange={editor.updateContent}
            onWordingStyleChange={editor.updateWordingStyle}
            onTitleChange={editor.updateTitle}
            otherModules={otherModules}
            onMoveLesson={onMoveLesson}
          />
          <LessonGap
            beforeId={lessons[i + 1]?.lessonId ?? null}
            onMove={editor.move}
            onInsertBlank={editor.insertBlank}
            onInsertSaved={editor.insertSaved}
            onInsertLibrary={editor.insertLibrary}
          />
        </Fragment>
      ))}
    </div>
  );
}
