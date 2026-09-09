import { useState } from "react";
import type { QuizLesson as QuizLessonType } from "@lms/shared";

export function QuizLesson({ content }: { content: QuizLessonType["content"] }) {
  const [selected, setSelected] = useState<Record<number, number>>({});

  return (
    <div>
      {content.questions.map((question, questionIndex) => {
        const pickedIndex = selected[questionIndex];
        const hasAnswered = pickedIndex !== undefined;
        return (
          <fieldset key={questionIndex}>
            <legend>{question.prompt}</legend>
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} style={{ display: "block" }}>
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  checked={pickedIndex === optionIndex}
                  onChange={() =>
                    setSelected((prev) => ({ ...prev, [questionIndex]: optionIndex }))
                  }
                />
                {option}
              </label>
            ))}
            {hasAnswered && (
              <p>{pickedIndex === question.correctIndex ? "Correct!" : "Not quite, try again."}</p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
