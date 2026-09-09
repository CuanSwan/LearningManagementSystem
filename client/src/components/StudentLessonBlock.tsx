import type { Lesson } from "@lms/shared";
import { LessonRenderer } from "./LessonRenderer.js";

export function StudentLessonBlock({
  lesson,
  isComplete,
  onToggle,
}: {
  lesson: Lesson;
  isComplete: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`student-lesson${isComplete ? " is-complete" : ""}`}>
      <LessonRenderer lesson={lesson} />
      <button type="button" className="complete-toggle" onClick={onToggle}>
        {isComplete ? "✓ Completed" : "Mark as complete"}
      </button>
    </div>
  );
}
