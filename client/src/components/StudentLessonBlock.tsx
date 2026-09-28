import type { Lesson, LessonType } from "../types.js";
import { LessonRenderer } from "./LessonRenderer.js";

// Each of these reads as a self-contained visual (its own counter/title/
// stations sit inside the component itself) - the type label on top of
// them is redundant chrome that breaks that illusion, unlike a plain text
// or quiz block where the label is the only cue to what kind of lesson it is.
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
        <div className="student-lesson-badges" />
        {isComplete && <span className="student-lesson-complete-badge">✓ Completed</span>}
      </div>
      <LessonRenderer lesson={lesson} isComplete={isComplete} onComplete={onComplete} />
    </div>
  );
}
