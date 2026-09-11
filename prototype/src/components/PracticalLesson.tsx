import { useState } from "react";
import type { PracticalLesson as PracticalLessonType } from "@lms/shared";

export function PracticalLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: PracticalLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  function toggleStep(stepIndex: number) {
    const next = { ...completed, [stepIndex]: !completed[stepIndex] };
    setCompleted(next);
    const allDone = content.steps.length > 0 && content.steps.every((_, i) => next[i]);
    if (!isComplete && allDone) onComplete();
  }

  return (
    <div className="practical-lesson">
      <p className="practical-lesson-instructions">{content.instructions}</p>
      <ol className="practical-lesson-steps">
        {content.steps.map((step, stepIndex) => (
          <li key={stepIndex}>
            <label>
              <input
                type="checkbox"
                checked={completed[stepIndex] ?? false}
                onChange={() => toggleStep(stepIndex)}
              />
              {step}
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}
