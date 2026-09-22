import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Lesson, LessonType } from "../types.js";
import { createModule } from "../api.js";
import { AdminToolsPanel } from "../components/AdminToolsPanel.js";
import { DraggableLessonBlock } from "../components/DraggableLessonBlock.js";
import { LIBRARY_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { useLessonListEditor } from "../useLessonListEditor.js";

// A standalone module, not yet attached to any course. Nothing is persisted
// until Create is pressed, and Create is refused while there are no lessons
// yet - an empty unassigned module is clutter, not a reusable component.
export function AdminNewModule() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editor = useLessonListEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [createStatus, setCreateStatus] = useState<"idle" | "creating" | "error">("idle");
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreate = title.trim().length > 0 && editor.lessons.length > 0;

  async function handleCreate() {
    if (!canCreate) return;
    setCreateStatus("creating");
    setCreateError(null);
    try {
      const created = await createModule({
        title,
        objective: objective || "Imported from the library.",
        category: category || undefined,
        lessons: editor.lessons,
      });
      navigate(`/admin/modules/${created.moduleId}`);
    } catch (err) {
      setCreateError((err as Error).message);
      setCreateStatus("error");
    }
  }

  return (
    <main>
      <p className="breadcrumb">
        <Link to="/admin">&larr; Back to courses</Link>
      </p>
      <div className="page-header">
        <div>
          <h1>New unassigned module</h1>
          <p>Not attached to a course yet - add at least one lesson, then create it to save it to the library.</p>
        </div>
        <div className="save-controls">
          <button type="button" onClick={handleCreate} disabled={!canCreate || createStatus === "creating"}>
            {createStatus === "creating" ? "Creating..." : "Create module"}
          </button>
          {createStatus === "error" && createError && <span className="save-status save-status-error">{createError}</span>}
        </div>
      </div>

      <div className="field-group">
        <label className="field">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field">
          Objective
          <input value={objective} onChange={(e) => setObjective(e.target.value)} />
        </label>
        <label className="field">
          Category
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Core, IT, Business" />
        </label>
      </div>

      {!canCreate && (
        <p className="import-error">
          {title.trim().length === 0 ? "Give it a title, and add" : "Add"} at least one lesson before creating - an empty
          module isn&apos;t worth saving to the library.
        </p>
      )}

      <div className="workspace">
        <div className="lesson-list">
          {editor.lessons.map((lesson) => (
            <DraggableLessonBlock
              key={lesson.lessonId}
              lesson={lesson}
              isEditing={editingId === lesson.lessonId}
              onReorder={editor.reorder}
              onSwapBlank={editor.swapBlank}
              onSwapSaved={editor.swapSaved}
              onSwapLibrary={editor.swapLibrary}
              onRemove={editor.remove}
              onToggleEdit={(id) => setEditingId((current) => (current === id ? null : id))}
              onContentChange={editor.updateContent}
              onWordingStyleChange={editor.updateWordingStyle}
            />
          ))}

          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const newType = e.dataTransfer.getData(NEW_LESSON_MIME) as LessonType | "";
              const savedId = e.dataTransfer.getData(SAVED_LESSON_MIME);
              const libraryJson = e.dataTransfer.getData(LIBRARY_LESSON_MIME);
              if (newType) editor.appendBlank(newType);
              else if (savedId) editor.appendSaved(savedId);
              else if (libraryJson) editor.appendLibrary(JSON.parse(libraryJson) as Lesson);
            }}
          >
            Drop a library block here to add it to the end
          </div>
        </div>
      </div>

      <AdminToolsPanel savedLessons={editor.savedLessons} onDropRemove={editor.remove} onImportLesson={editor.importLesson} />
    </main>
  );
}
