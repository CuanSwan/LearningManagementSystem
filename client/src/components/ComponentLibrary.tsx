import { LessonSchema, type Lesson } from "@lms/shared";
import { useState } from "react";
import { EXISTING_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { describeLesson, LESSON_TYPES, lessonTypeLabel } from "../lessonTemplates.js";

export function ComponentLibrary({
  savedLessons,
  onDropRemove,
  onImportLesson,
}: {
  savedLessons: Lesson[];
  onDropRemove: (lessonId: string) => void;
  onImportLesson: (lesson: Lesson) => void;
}) {
  const [importError, setImportError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        setImportError("That file isn't valid JSON.");
        return;
      }

      // Accepts either a single lesson object or an array of lessons (e.g. a
      // batch converted from another platform), validating each one individually.
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const imported: Lesson[] = [];
      const errors: string[] = [];
      candidates.forEach((candidate, index) => {
        const result = LessonSchema.safeParse(candidate);
        if (result.success) {
          imported.push(result.data);
        } else {
          const label = candidates.length > 1 ? `Item ${index + 1}: ` : "";
          errors.push(label + result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`).join("; "));
        }
      });

      if (imported.length === 0) {
        setImportError(errors.join(" | "));
        return;
      }
      setImportError(errors.length > 0 ? `Imported ${imported.length} lesson(s); skipped ${errors.length}: ${errors.join(" | ")}` : null);
      imported.forEach((lesson) => onImportLesson(lesson));
    };
    reader.readAsText(file);
  }

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

      <div className="library-section">
        <h3>Import lesson JSON</h3>
        <p className="library-section-hint">A single lesson, or a JSON array of several at once.</p>
        <input type="file" accept="application/json" onChange={handleFile} />
        {importError && <p className="import-error">{importError}</p>}
      </div>

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
