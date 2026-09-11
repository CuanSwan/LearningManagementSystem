import { useState } from "react";
import type { QuizLesson as QuizLessonType } from "@lms/shared";

export function QuizLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: QuizLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [selected, setSelected] = useState<Record<number, number>>({});

  function handleSelect(questionIndex: number, optionIndex: number) {
    const next = { ...selected, [questionIndex]: optionIndex };
    setSelected(next);
    if (!isComplete && Object.keys(next).length === content.questions.length) {
      onComplete();
    }
  }

  return (
    <div>
      {content.questions.map((question, questionIndex) => {
        const pickedIndex = selected[questionIndex];
        const hasAnswered = pickedIndex !== undefined;
        return (
          <fieldset key={questionIndex} className="quiz-question">
            <legend>{question.prompt}</legend>
            {question.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`quiz-option${pickedIndex === optionIndex ? " is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  checked={pickedIndex === optionIndex}
                  onChange={() => handleSelect(questionIndex, optionIndex)}
                />
                {option}
              </label>
            ))}
            {hasAnswered && (
              <p className="quiz-feedback">
                {pickedIndex === question.correctIndex ? "Correct!" : "Not quite, try again."}
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
