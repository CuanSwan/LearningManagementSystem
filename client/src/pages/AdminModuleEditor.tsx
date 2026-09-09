import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Lesson, LessonType, Module, ModuleStatus } from "@lms/shared";
import { getModule, saveModule } from "../api.js";
import { ComponentLibrary } from "../components/ComponentLibrary.js";
import { DraggableLessonBlock } from "../components/DraggableLessonBlock.js";
import { NEW_LESSON_MIME, SAVED_LESSON_MIME } from "../dnd.js";
import { createBlankLesson } from "../lessonTemplates.js";

export function AdminModuleEditor() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [foundModule, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [status, setStatus] = useState<ModuleStatus>("draft");

  useEffect(() => {
    if (!moduleId) return;
    getModule(moduleId)
      .then((data) => {
        setModule(data);
        setLessons([...data.lessons].sort((a, b) => a.order - b.order));
        setStatus(data.status);
      })
      .catch((err) => setError(err.message));
  }, [moduleId]);

  function reorder(draggedId: string, targetId: string) {
    setLessons((prev) => {
      const dragged = prev.find((l) => l.lessonId === draggedId);
      if (!dragged) return prev;
      const without = prev.filter((l) => l.lessonId !== draggedId);
      const targetIndex = without.findIndex((l) => l.lessonId === targetId);
      without.splice(targetIndex, 0, dragged);
      return without.map((l, i) => ({ ...l, order: i + 1 }));
    });
  }

  function swapBlank(targetId: string, newType: LessonType) {
    const displaced = lessons.find((l) => l.lessonId === targetId);
    if (!displaced) return;
    const blank = createBlankLesson(newType, displaced.order);
    setLessons((prev) => prev.map((l) => (l.lessonId === targetId ? blank : l)));
    setSavedLessons((prev) => [...prev, displaced]);
  }

  function swapSaved(targetId: string, savedLessonId: string) {
    const saved = savedLessons.find((l) => l.lessonId === savedLessonId);
    const displaced = lessons.find((l) => l.lessonId === targetId);
    if (!saved || !displaced) return;
    const restored = { ...saved, order: displaced.order };
    setLessons((prev) => prev.map((l) => (l.lessonId === targetId ? restored : l)));
    setSavedLessons((prev) => [...prev.filter((l) => l.lessonId !== savedLessonId), displaced]);
  }

  function remove(lessonId: string) {
    const removed = lessons.find((l) => l.lessonId === lessonId);
    if (!removed) return;
    setLessons((prev) =>
      prev.filter((l) => l.lessonId !== lessonId).map((l, i) => ({ ...l, order: i + 1 }))
    );
    setSavedLessons((prev) => [...prev, removed]);
  }

  function appendBlank(type: LessonType) {
    setLessons((prev) => [...prev, createBlankLesson(type, prev.length + 1)]);
  }

  function appendSaved(savedLessonId: string) {
    const saved = savedLessons.find((l) => l.lessonId === savedLessonId);
    if (!saved) return;
    setLessons((prev) => [...prev, { ...saved, order: prev.length + 1 }]);
    setSavedLessons((prev) => prev.filter((l) => l.lessonId !== savedLessonId));
  }

  function importLesson(lesson: Lesson) {
    setSavedLessons((prev) => [...prev, lesson]);
  }

  function updateContent(lessonId: string, content: Lesson["content"]) {
    setLessons((prev) =>
      // The editor form only ever produces a content shape matching the lesson's
      // own type, but TypeScript can't correlate that through the union - assert it.
      prev.map((l) => (l.lessonId === lessonId ? ({ ...l, content } as Lesson) : l))
    );
  }

  async function handleSave() {
    if (!foundModule) return;
    setSaveStatus("saving");
    try {
      const saved = await saveModule(foundModule.moduleId, { ...foundModule, lessons, status });
      setModule(saved);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  if (error) return <p>Failed to load module: {error}</p>;
  if (!foundModule) return <p>Loading...</p>;

  return (
    <main>
      <p className="breadcrumb">
        <Link to={`/admin/courses/${foundModule.courseId}`}>&larr; Back to course</Link>
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
          {saveStatus === "saved" && <span className="save-status save-status-ok">Saved</span>}
          {saveStatus === "error" && <span className="save-status save-status-error">Save failed</span>}
        </div>
      </div>

      <div className="workspace">
        <div className="lesson-list">
          {lessons.map((lesson) => (
            <DraggableLessonBlock
              key={lesson.lessonId}
              lesson={lesson}
              isEditing={editingId === lesson.lessonId}
              onReorder={reorder}
              onSwapBlank={swapBlank}
              onSwapSaved={swapSaved}
              onRemove={remove}
              onToggleEdit={(id) => setEditingId((current) => (current === id ? null : id))}
              onContentChange={updateContent}
            />
          ))}

          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const newType = e.dataTransfer.getData(NEW_LESSON_MIME) as LessonType | "";
              const savedId = e.dataTransfer.getData(SAVED_LESSON_MIME);
              if (newType) appendBlank(newType);
              else if (savedId) appendSaved(savedId);
            }}
          >
            Drop a library block here to add it to the end
          </div>
        </div>

        <ComponentLibrary savedLessons={savedLessons} onDropRemove={remove} onImportLesson={importLesson} />
      </div>
    </main>
  );
}
