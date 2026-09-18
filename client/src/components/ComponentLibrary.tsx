import type { Lesson } from "../types.js";
import { EXISTING_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { describeLesson, LESSON_TYPES, lessonTypeLabel } from "../lessonTemplates.js";

export function ComponentLibrary({
  savedLessons,
  onDropRemove,
}: {
  savedLessons: Lesson[];
  onDropRemove: (lessonId: string) => void;
}) {
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
        >
          {lessonTypeLabel(type)}
        </div>
      ))}

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
    </aside>
  );
}
