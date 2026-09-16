import { useMemo, useState } from "react";
import type { MatchingLesson as MatchingLessonType } from "../types.js";

function shuffledIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function MatchingLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: MatchingLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const matchOrder = useMemo(() => shuffledIndices(content.pairs.length), [content.pairs]);
  const [matched, setMatched] = useState<Record<number, boolean>>({});
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  function attemptMatch(matchPairIndex: number) {
    if (selectedPrompt === null) return;
    if (selectedPrompt === matchPairIndex) {
      const next = { ...matched, [selectedPrompt]: true };
      setMatched(next);
      setFeedback("correct");
      const allMatched = content.pairs.every((_, i) => next[i]);
      if (!isComplete && allMatched) onComplete();
    } else {
      setFeedback("incorrect");
    }
    setSelectedPrompt(null);
  }

  return (
    <div className="matching-lesson">
      <div className="matching-lesson-columns">
        <div className="matching-lesson-column">
          {content.pairs.map((pair, pairIndex) => (
            <button
              key={pairIndex}
              type="button"
              disabled={matched[pairIndex]}
              className={`matching-item${selectedPrompt === pairIndex ? " is-selected" : ""}${matched[pairIndex] ? " is-matched" : ""}`}
              onClick={() => {
                setSelectedPrompt(pairIndex);
                setFeedback(null);
              }}
            >
              {pair.prompt}
            </button>
          ))}
        </div>
        <div className="matching-lesson-column">
          {matchOrder.map((pairIndex) => (
            <button
              key={pairIndex}
              type="button"
              disabled={matched[pairIndex] || selectedPrompt === null}
              className={`matching-item${matched[pairIndex] ? " is-matched" : ""}`}
              onClick={() => attemptMatch(pairIndex)}
            >
              {content.pairs[pairIndex].match}
            </button>
          ))}
        </div>
      </div>
      {feedback && <p className="matching-feedback">{feedback === "correct" ? "Correct!" : "Not quite, try again."}</p>}
    </div>
  );
}
