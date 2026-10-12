import { useState } from "react";
import type { Lesson, LessonType } from "../types.js";
import { CLIPBOARD_LESSON_MIME, EXISTING_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { createPreviewLesson, describeLesson, LESSON_TYPES, lessonTypeLabel } from "../lessonTemplates.js";
import { useLessonClipboard } from "../lessonClipboard.js";
import { ComponentPreviewPopover } from "./ComponentPreviewPopover.js";

export function ComponentLibrary({
  savedLessons,
  onDropRemove,
  onDropToClipboard,
}: {
  savedLessons: Lesson[];
  onDropRemove: (lessonId: string) => void;
  // Stages an existing lesson onto the cross-module clipboard instead of
  // this module's own local "saved lessons" - see lessonClipboard.ts.
  onDropToClipboard: (lessonId: string) => void;
}) {
  const clipboard = useLessonClipboard();
  const [hovered, setHovered] = useState<{ type: LessonType; rect: DOMRect } | null>(null);

  return (
    <aside
      className="component-library"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const existingId = e.dataTransfer.getData(EXISTING_LESSON_MIME);
        if (existingId) onDropRemove(existingId);
      }}
    >
      <h2>Component library</h2>
      <p>Drag a block into the module to add it. Drag a module block here to remove it.</p>
      {LESSON_TYPES.map((type) => (
        <div
          key={type}
          className="library-item"
          draggable
          onDragStart={(e) => e.dataTransfer.setData(NEW_LESSON_MIME, type)}
          onMouseEnter={(e) => setHovered({ type, rect: e.currentTarget.getBoundingClientRect() })}
          onMouseLeave={() => setHovered(null)}
        >
          {lessonTypeLabel(type)}
        </div>
      ))}
      {hovered && (
        <ComponentPreviewPopover type={hovered.type} lesson={createPreviewLesson(hovered.type)} anchorRect={hovered.rect} />
      )}

      {savedLessons.length > 0 && (
        <div className="library-section">
          <h3>Removed lessons</h3>
          {savedLessons.map((lesson) => (
            <div
              key={lesson.lessonId}
              className="library-item library-item-saved"
              draggable
              onDragStart={(e) => e.dataTransfer.setData(SAVED_LESSON_MIME, lesson.lessonId)}
            >
              <span className="library-item-type">{lessonTypeLabel(lesson.type)}</span>
              <span className="library-item-preview">{describeLesson(lesson)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Moving a lesson to a different module: drag it here (or use its
          "Move to clipboard" button) to pull it out, then open the target
          module and drag it from here into that module's lesson list - the
          clipboard is shared across every module editor page, unlike
          "Removed lessons" above which only this module can see. */}
      <div
        className="library-section library-clipboard"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const existingId = e.dataTransfer.getData(EXISTING_LESSON_MIME);
          if (existingId) onDropToClipboard(existingId);
        }}
      >
        <h3>Clipboard</h3>
        <p className="library-section-hint">Drag a lesson here to move it to another module.</p>
        {clipboard.length === 0 ? (
          <p className="library-tree-empty">Nothing on the clipboard</p>
        ) : (
          clipboard.map((lesson) => (
            <div
              key={lesson.lessonId}
              className="library-item library-item-saved"
              draggable
              onDragStart={(e) => e.dataTransfer.setData(CLIPBOARD_LESSON_MIME, JSON.stringify(lesson))}
            >
              <span className="library-item-type">{lessonTypeLabel(lesson.type)}</span>
              <span className="library-item-preview">{describeLesson(lesson)}</span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
