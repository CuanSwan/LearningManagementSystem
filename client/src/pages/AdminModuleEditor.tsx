import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Module, ModuleStatus } from "../types.js";
import { getModule, listModulesByCourse, moveLessonToModule, saveModule, unassignModule } from "../api.js";
import { AdminToolsPanel } from "../components/AdminToolsPanel.js";
import { LessonList } from "../components/LessonList.js";
import { useLessonListEditor } from "../useLessonListEditor.js";

export function AdminModuleEditor() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [foundModule, setModule] = useState<Module | null>(null);
  const editor = useLessonListEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [status, setStatus] = useState<ModuleStatus>("draft");
  const [unassigning, setUnassigning] = useState(false);
  // Other modules on the same course, for the "move lesson to another
  // module" picker - a lesson can only move somewhere, so this stays empty
  // (hiding the picker) for a standalone library module or a course with
  // only one module.
  const [otherModules, setOtherModules] = useState<Module[]>([]);
  const [moveError, setMoveError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    getModule(moduleId)
      .then((data) => {
        setModule(data);
        editor.reset(data.lessons);
        setStatus(data.status);
        if (data.courseId) {
          listModulesByCourse(data.courseId).then((siblings) =>
            setOtherModules(siblings.filter((m) => m.moduleId !== moduleId))
          );
        }
      })
      .catch((err) => setError(err.message));
    // editor's identity is stable across renders (its setters don't change) -
    // only re-fetch when the route's moduleId actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  // Returns the freshly-saved module on success, or null on failure -
  // handleMoveLesson below needs to know which, since moving a lesson
  // without first saving pending edits would let the move's own refetch
  // silently discard them.
  async function handleSave(): Promise<Module | null> {
    if (!foundModule) return null;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const saved = await saveModule(foundModule.moduleId, { ...foundModule, lessons: editor.lessons, status });
      setModule(saved);
      setSaveStatus("saved");
      return saved;
    } catch (err) {
      setSaveError((err as Error).message);
      setSaveStatus("error");
      return null;
    }
  }

  // Moving a lesson is an immediate, atomic server action (see
  // store.ts's moveLessonToModule) rather than something staged in this
  // module's local draft like every other edit here - it touches two
  // modules at once, which a single module's draft-plus-Save model can't
  // represent. Saving first means it acts on (and this editor ends up
  // reflecting) the admin's actual intended state, not a stale server copy
  // with whatever's currently unsaved silently dropped.
  async function handleMoveLesson(lessonId: string, targetModuleId: string) {
    setMoveError(null);
    const saved = await handleSave();
    if (!saved) return;
    try {
      const { sourceModule } = await moveLessonToModule(saved.moduleId, lessonId, targetModuleId);
      setModule(sourceModule);
      editor.reset(sourceModule.lessons);
    } catch (err) {
      setMoveError((err as Error).message);
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
          {saveStatus === "error" && (
            <span className="save-status save-status-error">{saveError ?? "Save failed"}</span>
          )}
        </div>
      </div>

      {moveError && <p className="save-status save-status-error">{moveError}</p>}

      <div className="workspace">
        <LessonList
          editor={editor}
          editingId={editingId}
          onToggleEdit={(id) => setEditingId((current) => (current === id ? null : id))}
          otherModules={otherModules}
          onMoveLesson={handleMoveLesson}
        />
      </div>

      <AdminToolsPanel savedLessons={editor.savedLessons} onDropRemove={editor.remove} onImportLesson={editor.importLesson} />
    </main>
  );
}
