import { useState } from "react";
import type { DialLesson as DialLessonType } from "../types.js";

// Geometry for the ring of nodes - these pixel values match the fixed
// .dial-lesson-dial/.dial-lesson-hub sizing in App.css, so keep them in
// sync if either changes. Nodes are placed evenly around a circle of
// radius DIAL_RADIUS centered on the dial, starting straight up and going
// clockwise - however many stages there are.
const DIAL_SIZE = 260;
const DIAL_CENTER = DIAL_SIZE / 2;
const DIAL_RADIUS = 99;
const MAX_NODE_SIZE = 35;
const MIN_NODE_SIZE = 10;
// Below this node size the "01" style number no longer fits legibly - the
// node becomes a plain dot instead (still selectable, still has an
// aria-label for screen readers).
const NODE_LABEL_MIN_SIZE = 16;

// The dial's radius is fixed regardless of stage count, so more stages
// means less arc length per node - node size is capped at the distance
// between adjacent node centers (the chord), with some breathing room,
// so a 100-stage dial shrinks to small dots instead of an overlapping mess.
function nodeSize(total: number): number {
  const chord = 2 * DIAL_RADIUS * Math.sin(Math.PI / total);
  return Math.min(MAX_NODE_SIZE, Math.max(MIN_NODE_SIZE, chord * 0.72));
}

function nodePosition(index: number, total: number, size: number): { left: number; top: number } {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  const centerX = DIAL_CENTER + DIAL_RADIUS * Math.cos(angle);
  const centerY = DIAL_CENTER + DIAL_RADIUS * Math.sin(angle);
  return { left: centerX - size / 2, top: centerY - size / 2 };
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
  const size = nodeSize(total);
  const showLabel = size >= NODE_LABEL_MIN_SIZE;

  return (
    <div className="dial-lesson">
      <div className="dial-lesson-dial">
        <div className="dial-lesson-ring" />
        {content.stages.map((_, i) => {
          const { left, top } = nodePosition(i, total, size);
          return (
            <button
              key={i}
              type="button"
              className="dial-lesson-node"
              style={{ left: `${left}px`, top: `${top}px`, width: `${size}px`, height: `${size}px`, fontSize: `${Math.min(size * 0.32, 12)}px` }}
              aria-selected={selected === i}
              aria-label={`Stage ${i + 1} of ${total}`}
              onClick={() => select(i)}
            >
              {showLabel ? pad(i + 1) : null}
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
