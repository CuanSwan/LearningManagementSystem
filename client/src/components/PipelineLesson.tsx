import { useState } from "react";
import type { PipelineLesson as PipelineLessonType } from "../types.js";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function PipelineLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: PipelineLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const total = content.steps.length;

  function select(index: number) {
    setActive(index);
    if (seen.has(index)) return;
    const next = new Set(seen).add(index);
    setSeen(next);
    if (!isComplete && next.size === total) onComplete();
  }

  function next() {
    select(active >= total - 1 ? 0 : active + 1);
  }

  const fillPercent = total > 1 ? (active / (total - 1)) * 84 : 0;

  return (
    <div className="pipeline-lesson">
      <div className="pipeline-lesson-track">
        <div className="pipeline-lesson-rail" />
        <div className="pipeline-lesson-fill" style={{ width: `${fillPercent}%` }} />
        <div
          className="pipeline-lesson-stations"
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        >
          {content.steps.map((step, i) => (
            <button
              key={i}
              type="button"
              className={`pipeline-lesson-station${i <= active ? " reached" : ""}${i === active ? " active" : ""}`}
              aria-selected={i === active}
              onClick={() => select(i)}
            >
              <span className="pipeline-lesson-dot" />
              <span className="pipeline-lesson-meta">Step {pad(i + 1)}</span>
              <span className="pipeline-lesson-title">{step.title}</span>
              <span className="pipeline-lesson-body">{step.body}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="pipeline-lesson-actions">
        <button type="button" className="pipeline-lesson-next" onClick={next}>
          Next stage
        </button>
      </div>
    </div>
  );
}
