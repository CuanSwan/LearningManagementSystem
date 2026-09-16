import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Lesson, LessonType, Module, ModuleStatus } from "../types.js";
import { getModule, saveModule, unassignModule } from "../api.js";
import { ComponentLibrary } from "../components/ComponentLibrary.js";
import { DraggableLessonBlock } from "../components/DraggableLessonBlock.js";
import { LIBRARY_LESSON_MIME, NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { useLessonListEditor } from "../useLessonListEditor.js";

export function AdminModuleEditor() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [foundModule, setModule] = useState<Module | null>(null);
  const editor = useLessonListEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [status, setStatus] = useState<ModuleStatus>("draft");
  const [unassigning, setUnassigning] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    getModule(moduleId)
      .then((data) => {
        setModule(data);
        editor.reset(data.lessons);
        setStatus(data.status);
      })
      .catch((err) => setError(err.message));
    // editor's identity is stable across renders (its setters don't change) -
    // only re-fetch when the route's moduleId actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  async function handleSave() {
    if (!foundModule) return;
    setSaveStatus("saving");
    try {
      const saved = await saveModule(foundModule.moduleId, { ...foundModule, lessons: editor.lessons, status });
      setModule(saved);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleUnassign() {
    if (!foundModule) return;
    if (!confirm("Remove this module from its course? It'll move to the unassigned library, reusable from any course.")) return;
    setUnassigning(true);
    try {
      const updated = await unassignModule(foundModule.moduleId);
      if (updated) {
        setModule(updated);
      } else {
        // No lessons yet - the server deletes an empty unassigned module
        // rather than keeping it as clutter, so there's nothing left to edit.
        navigate("/admin");
      }
    } finally {
      setUnassigning(false);
    }
  }

  if (error) return <p>Failed to load module: {error}</p>;
  if (!foundModule) return <p>Loading...</p>;

  return (
    <main>
      <p className="breadcrumb">
        {foundModule.courseId ? (
          <Link to={`/admin/courses/${foundModule.courseId}`}>&larr; Back to course</Link>
        ) : (
          <Link to="/admin">&larr; Back to courses (unassigned module)</Link>
        )}
      </p>
      <div className="page-header">
        <div>
          <h1>{foundModule.seed.title}</h1>
          <p>{foundModule.seed.objective}</p>
        </div>
        <div className="save-controls">
          <label className="status-select">
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as ModuleStatus)}>
              <option value="draft">Draft</option>
              <option value="ai_generated">AI-generated</option>
              <option value="published">Published</option>
            </select>
          </label>
          <button type="button" onClick={handleSave} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </button>
          {foundModule.courseId && (
            <button type="button" onClick={handleUnassign} disabled={unassigning}>
              {unassigning ? "Unassigning..." : "Unassign from course"}
            </button>
          )}
          {saveStatus === "saved" && <span className="save-status save-status-ok">Saved</span>}
          {saveStatus === "error" && <span className="save-status save-status-error">Save failed</span>}
        </div>
      </div>

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

        <ComponentLibrary savedLessons={editor.savedLessons} onDropRemove={editor.remove} onImportLesson={editor.importLesson} />
      </div>
    </main>
  );
}
