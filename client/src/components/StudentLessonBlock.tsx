import type { Lesson, LessonType } from "../types.js";
import { LessonRenderer } from "./LessonRenderer.js";

// Each of these reads as a self-contained visual (its own per-item titles/
// stations sit inside the component itself) - wrapping it in a bordered
// card on top doubles up on framing, unlike a plain text or quiz block.
// The lesson's own title still shows above either way (see
// student-lesson-title below) - only the card chrome differs.
const DYNAMIC_COMPONENT_TYPES: Set<LessonType> = new Set([
  "dial",
  "pipeline",
  "presentationDial",
  "cardGrid",
  "hotspots",
  "treeScrub",
]);

export function StudentLessonBlock({
  lesson,
  isComplete,
  onComplete,
}: {
  lesson: Lesson;
  isComplete: boolean;
  onComplete: () => void;
}) {
  const isDynamicComponent = DYNAMIC_COMPONENT_TYPES.has(lesson.type);
  return (
    <div
      // student-lesson-<type> exists so quiz/practical can keep the card
      // border other lesson types just lost - see .student-lesson in App.css.
      className={`student-lesson student-lesson-${lesson.type}${isComplete ? " is-complete" : ""}${isDynamicComponent ? " is-floating" : ""}`}
    >
      <div className="student-lesson-header">
        <h2 className="student-lesson-title">{lesson.title}</h2>
        {isComplete && <span className="student-lesson-complete-badge">✓ Completed</span>}
      </div>
      <LessonRenderer lesson={lesson} isComplete={isComplete} onComplete={onComplete} />
    </div>
  );
}
