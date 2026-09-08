import { EXISTING_LESSON_MIME, NEW_LESSON_MIME } from "../dnd.js";
import { LESSON_TYPES, lessonTypeLabel } from "../lessonTemplates.js";

export function ComponentLibrary({ onDropRemove }: { onDropRemove: (lessonId: string) => void }) {
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
    </aside>
  );
}
