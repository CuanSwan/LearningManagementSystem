import { useEffect, useState } from "react";
import type { Lesson, LessonType, Module } from "@lms/shared";
import { ComponentLibrary } from "./components/ComponentLibrary.js";
import { DraggableLessonBlock } from "./components/DraggableLessonBlock.js";
import { LessonRenderer } from "./components/LessonRenderer.js";
import { NEW_LESSON_MIME, SAVED_LESSON_MIME } from "./dnd.js";
import { createBlankLesson } from "./lessonTemplates.js";

export function App() {
  const [foundModule, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/modules/intro-to-negotiation")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: Module) => {
        setModule(data);
        setLessons([...data.lessons].sort((a, b) => a.order - b.order));
      })
      .catch((err) => setError(err.message));
  }, []);

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
    // Preserve the target's position but restore the saved lesson's own content wholesale.
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

  if (error) return <p>Failed to load module: {error}</p>;
  if (!foundModule) return <p>Loading...</p>;

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>{foundModule.seed.title}</h1>
          <p>{foundModule.seed.objective}</p>
        </div>
        <button type="button" onClick={() => setIsAdmin((v) => !v)}>
          {isAdmin ? "Exit admin mode" : "Enter admin mode"}
        </button>
      </div>

      <div className="workspace">
        <div className="lesson-list">
          {lessons.map((lesson) =>
            isAdmin ? (
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
            ) : (
              <LessonRenderer key={lesson.lessonId} lesson={lesson} />
            )
          )}

          {isAdmin && (
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
          )}
        </div>

        {isAdmin && (
          <ComponentLibrary savedLessons={savedLessons} onDropRemove={remove} onImportLesson={importLesson} />
        )}
      </div>
    </main>
  );
}
