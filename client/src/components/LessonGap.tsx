import { useState } from "react";
import { EXISTING_LESSON_MIME, LIBRARY_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import type { Lesson, LessonType } from "../types.js";

// A drop target sitting between two lesson blocks (or before the first /
// after the last) - the actual position a dragged-or-new block lands at.
// Kept as its own explicit target rather than making each lesson block
// double as one, since "drop onto a block" is ambiguous about where
// relative to it you meant (insert before it? after it? swap it out
// entirely?) - dropping into a gap always means "insert/move here,
// exactly," in a way that works the same regardless of which direction
// you're dragging.
export function LessonGap({
  beforeId,
  emptyLabel,
  onMove,
  onInsertBlank,
  onInsertSaved,
  onInsertLibrary,
}: {
  beforeId: string | null;
  // Shown (in place of the default slim, wordless strip) when this is the
  // only gap in the list - an empty module's sole drop target needs to be
  // inviting and explain itself, not a barely-visible sliver.
  emptyLabel?: string;
  onMove: (draggedId: string, beforeId: string | null) => void;
  onInsertBlank: (type: LessonType, beforeId: string | null) => void;
  onInsertSaved: (savedLessonId: string, beforeId: string | null) => void;
  onInsertLibrary: (lesson: Lesson, beforeId: string | null) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={`lesson-gap${isOver ? " is-over" : ""}${emptyLabel ? " lesson-gap-empty" : ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsOver(true)}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        const newType = e.dataTransfer.getData(NEW_LESSON_MIME) as LessonType | "";
        const savedId = e.dataTransfer.getData(SAVED_LESSON_MIME);
        const libraryJson = e.dataTransfer.getData(LIBRARY_LESSON_MIME);
        const draggedId = e.dataTransfer.getData(EXISTING_LESSON_MIME);
        if (newType) onInsertBlank(newType, beforeId);
        else if (savedId) onInsertSaved(savedId, beforeId);
        else if (libraryJson) onInsertLibrary(JSON.parse(libraryJson) as Lesson, beforeId);
        else if (draggedId) onMove(draggedId, beforeId);
      }}
    >
      {emptyLabel && <span>{emptyLabel}</span>}
    </div>
  );
}
