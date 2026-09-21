import { useState } from "react";
import type { PresentationDialLesson as PresentationDialLessonType } from "../types.js";

const WINDOW_SIZE = 4;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function PresentationDialLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: PresentationDialLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const total = content.stages.length;

  function goTo(index: number) {
    setCurrent(index);
    if (seen.has(index)) return;
    const next = new Set(seen).add(index);
    setSeen(next);
    if (!isComplete && next.size === total) onComplete();
  }

  const windowStart = Math.max(0, current - (WINDOW_SIZE - 1));
  const windowIndices: number[] = [];
  for (let i = windowStart; i <= current; i++) windowIndices.push(i);

  const stage = content.stages[current];

  return (
    <div className="presentationdial-lesson">
      <div className="presentationdial-lesson-track">
        {windowIndices.map((i, pos) => (
          <div
            key={i}
            className={`presentationdial-lesson-node${i === current ? " active" : ""}`}
            style={{ opacity: Math.max(0.4, 1 - (windowIndices.length - 1 - pos) * 0.22) }}
            aria-hidden="true"
          >
            {pad(i + 1)}
          </div>
        ))}
      </div>
      <div className="presentationdial-lesson-stage">
        <button
          type="button"
          className="presentationdial-lesson-nav prev"
          aria-label="Previous stage"
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="presentationdial-lesson-card">
          <span className="presentationdial-lesson-counter">
            {pad(current + 1)} / {pad(total)}
          </span>
          <h3 className="presentationdial-lesson-title">{stage.title}</h3>
          <p className="presentationdial-lesson-body">{stage.body}</p>
        </div>
        <button
          type="button"
          className="presentationdial-lesson-nav next"
          aria-label="Next stage"
          disabled={current === total - 1}
          onClick={() => goTo(current + 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
