import { useState } from "react";
import type { PracticalLesson as PracticalLessonType } from "@lms/shared";

export function PracticalLesson({ content }: { content: PracticalLessonType["content"] }) {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  return (
    <div>
      <p>{content.instructions}</p>
      <ol>
        {content.steps.map((step, stepIndex) => (
          <li key={stepIndex}>
            <label>
              <input
                type="checkbox"
                checked={completed[stepIndex] ?? false}
                onChange={() =>
                  setCompleted((prev) => ({ ...prev, [stepIndex]: !prev[stepIndex] }))
                }
              />
              {step}
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}
