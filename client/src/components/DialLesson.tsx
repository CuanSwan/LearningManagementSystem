import { useState } from "react";
import type { DialLesson as DialLessonType } from "../types.js";

// Geometry for the ring of nodes - these pixel values match the fixed
// .dial-lesson-dial/.dial-lesson-node/.dial-lesson-hub sizing in App.css,
// so keep them in sync if either changes. Nodes are placed evenly around a
// circle of radius DIAL_RADIUS centered on the dial, starting straight up
// and going clockwise - however many stages there are.
const DIAL_SIZE = 260;
const DIAL_CENTER = DIAL_SIZE / 2;
const DIAL_RADIUS = 99;
const NODE_SIZE = 35;

function nodePosition(index: number, total: number): { left: number; top: number } {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  const centerX = DIAL_CENTER + DIAL_RADIUS * Math.cos(angle);
  const centerY = DIAL_CENTER + DIAL_RADIUS * Math.sin(angle);
  return { left: centerX - NODE_SIZE / 2, top: centerY - NODE_SIZE / 2 };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function DialLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: DialLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const total = content.stages.length;

  function select(index: number) {
    setSelected(index);
    if (seen.has(index)) return;
    const next = new Set(seen).add(index);
    setSeen(next);
    if (!isComplete && next.size === total) onComplete();
  }

  const stage = content.stages[selected];

  return (
    <div className="dial-lesson">
      <div className="dial-lesson-dial">
        <div className="dial-lesson-ring" />
        {content.stages.map((_, i) => {
          const { left, top } = nodePosition(i, total);
          return (
            <button
              key={i}
              type="button"
              className="dial-lesson-node"
              style={{ left: `${left}px`, top: `${top}px` }}
              aria-selected={selected === i}
              aria-label={`Stage ${i + 1} of ${total}`}
              onClick={() => select(i)}
            >
              {pad(i + 1)}
            </button>
          );
        })}
        <div className="dial-lesson-hub">
          <span className="dial-lesson-hub-count">
            {total} Stage{total === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      <div className="dial-lesson-detail">
        <span className="dial-lesson-counter">
          Stage {pad(selected + 1)} of {pad(total)}
        </span>
        <h3 className="dial-lesson-title">{stage.title}</h3>
        <p className="dial-lesson-body">{stage.body}</p>
        <div className="dial-lesson-hint">Select a stage on the dial to read it.</div>
      </div>
    </div>
  );
}
