import { useEffect, useState } from "react";
import type { Lesson, LessonType, Module } from "@lms/shared";
import { ComponentLibrary } from "./components/ComponentLibrary.js";
import { DraggableLessonBlock } from "./components/DraggableLessonBlock.js";
import { LessonRenderer } from "./components/LessonRenderer.js";
import { NEW_LESSON_MIME } from "./dnd.js";
import { createBlankLesson } from "./lessonTemplates.js";

export function App() {
  const [foundModule, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
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

  function swap(targetId: string, newType: LessonType) {
    setLessons((prev) =>
      prev.map((l) => (l.lessonId === targetId ? createBlankLesson(newType, l.order) : l))
    );
  }

  function remove(lessonId: string) {
    setLessons((prev) =>
      prev.filter((l) => l.lessonId !== lessonId).map((l, i) => ({ ...l, order: i + 1 }))
    );
  }

  function appendFromLibrary(type: LessonType) {
    setLessons((prev) => [...prev, createBlankLesson(type, prev.length + 1)]);
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
                onReorder={reorder}
                onSwap={swap}
                onRemove={remove}
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
                if (newType) appendFromLibrary(newType);
              }}
            >
              Drop a library block here to add it to the end
            </div>
          )}
        </div>

        {isAdmin && <ComponentLibrary onDropRemove={remove} />}
      </div>
    </main>
  );
}
