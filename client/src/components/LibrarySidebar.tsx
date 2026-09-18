import { useState } from "react";
import { LessonSchema } from "../lessonSchema.js";
import type { Lesson } from "../types.js";
import { CourseLibraryTree } from "./CourseLibraryTree.js";

export function LibrarySidebar({ onImportLesson }: { onImportLesson: (lesson: Lesson) => void }) {
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
    <aside className="library-sidebar">
      <CourseLibraryTree />

      <div className="library-section">
        <h3>Import lesson JSON</h3>
        <p className="library-section-hint">A single lesson, or a JSON array of several at once.</p>
        <input type="file" accept="application/json" onChange={handleFile} />
        {importError && <p className="import-error">{importError}</p>}
      </div>
    </aside>
  );
}
