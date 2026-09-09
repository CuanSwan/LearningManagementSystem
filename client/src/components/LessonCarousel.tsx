import { useState } from "react";
import type { Lesson } from "@lms/shared";
import { StudentLessonBlock } from "./StudentLessonBlock.js";

export function LessonCarousel({
  lessons,
  completedIds,
  onToggle,
}: {
  lessons: Lesson[];
  completedIds: Set<string>;
  onToggle: (lessonId: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const lesson = lessons[index];

  if (!lesson) return null;

  return (
    <div className="lesson-carousel">
      <StudentLessonBlock
        lesson={lesson}
        isComplete={completedIds.has(lesson.lessonId)}
        onToggle={() => onToggle(lesson.lessonId)}
      />
      <div className="carousel-nav">
        <button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          &larr; Previous
        </button>
        <span className="carousel-position">
          {index + 1} of {lessons.length}
        </span>
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
