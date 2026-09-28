import { useEffect, useState } from "react";
import type { Lesson, LessonReviewStatus } from "../types.js";
import { StudentLessonBlock } from "./StudentLessonBlock.js";

export function LessonCarousel({
  moduleId,
  lessons,
  completedIds,
  initialLessonId,
  onComplete,
  onCurrentLessonChange,
  onReviewStatusChange,
  nextModuleTitle,
  onNextModule,
}: {
  moduleId: string;
  lessons: Lesson[];
  completedIds: Set<string>;
  initialLessonId?: string;
  onComplete: (lessonId: string) => void;
  onCurrentLessonChange?: (lesson: Lesson) => void;
  onReviewStatusChange: (lessonId: string, reviewStatus: LessonReviewStatus | undefined) => void;
  // Absent when there's no next module, or it's locked for this user - the
  // Next button stays disabled at the last lesson the same way it always
  // has. Provided, it turns that same button into a way to keep moving
  // forward into the next module instead of dead-ending.
  nextModuleTitle?: string;
  onNextModule?: () => void;
}) {
  const [index, setIndex] = useState(() => {
    const i = lessons.findIndex((l) => l.lessonId === initialLessonId);
    return i >= 0 ? i : 0;
  });
  const lesson = lessons[index];
  const isLastLesson = index === lessons.length - 1;

  useEffect(() => {
    if (lesson) onCurrentLessonChange?.(lesson);
  }, [lesson, onCurrentLessonChange]);

  if (!lesson) return null;

  return (
    <div className="lesson-carousel">
      <StudentLessonBlock
        moduleId={moduleId}
        lesson={lesson}
        isComplete={completedIds.has(lesson.lessonId)}
        onComplete={() => onComplete(lesson.lessonId)}
        onReviewStatusChange={onReviewStatusChange}
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
          onClick={() => {
            if (isLastLesson && onNextModule) onNextModule();
            else setIndex((i) => Math.min(lessons.length - 1, i + 1));
          }}
          disabled={isLastLesson && !onNextModule}
        >
          {isLastLesson && onNextModule ? `Next: ${nextModuleTitle ?? "next module"} →` : "Next →"}
        </button>
      </div>
    </div>
  );
}
