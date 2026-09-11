import type { Lesson } from "@lms/shared";
import { lessonTypeLabel } from "../lessonTemplates.js";
import { LessonRenderer } from "./LessonRenderer.js";

export function StudentLessonBlock({
  lesson,
  isComplete,
  onComplete,
}: {
  lesson: Lesson;
  isComplete: boolean;
  onComplete: () => void;
}) {
  return (
    <div className={`student-lesson${isComplete ? " is-complete" : ""}`}>
      <div className="student-lesson-header">
        <span className="student-lesson-type">{lessonTypeLabel(lesson.type)}</span>
        {isComplete && <span className="student-lesson-complete-badge">✓ Completed</span>}
      </div>
      <LessonRenderer lesson={lesson} isComplete={isComplete} onComplete={onComplete} />
    </div>
  );
}
