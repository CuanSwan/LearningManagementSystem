import { useEffect, useState } from "react";
import type { Lesson } from "@lms/shared";
import { StudentLessonBlock } from "./StudentLessonBlock.js";

export function LessonCarousel({
  lessons,
  completedIds,
  onComplete,
  onCurrentLessonChange,
}: {
  lessons: Lesson[];
  completedIds: Set<string>;
  onComplete: (lessonId: string) => void;
  onCurrentLessonChange?: (lesson: Lesson) => void;
}) {
  const [index, setIndex] = useState(0);
  const lesson = lessons[index];

  useEffect(() => {
    if (lesson) onCurrentLessonChange?.(lesson);
  }, [lesson, onCurrentLessonChange]);

  if (!lesson) return null;

  return (
    <div className="lesson-carousel">
      <StudentLessonBlock
        lesson={lesson}
        isComplete={completedIds.has(lesson.lessonId)}
        onComplete={() => onComplete(lesson.lessonId)}
      />

      <div className="carousel-dots" role="tablist" aria-label="Lessons">
        {lessons.map((l, i) => (
          <button
            key={l.lessonId}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Lesson ${i + 1}${completedIds.has(l.lessonId) ? " (completed)" : ""}`}
            className={`carousel-dot${i === index ? " active" : ""}${
              completedIds.has(l.lessonId) ? " is-complete" : ""
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <div className="carousel-nav">
        <button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          &larr; Previous
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(lessons.length - 1, i + 1))}
          disabled={index === lessons.length - 1}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
