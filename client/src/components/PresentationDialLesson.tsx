import { useState } from "react";
import type { PresentationDialLesson as PresentationDialLessonType } from "../types.js";

// A fixed-size ring sits behind a concentric card, mirroring the source
// mockup's dial-wrap + card-zone overlap. Kept to a single fixed size
// (matching DialLesson's 260px ring) rather than a responsive multi-size
// scheme.
const WINDOW_SIZE = 4;
const CENTER = 130;
const NODE_RADIUS = 118;
const NODE_SIZE = 30;
// Spread the (up to) 4 visible dots evenly around the full circle - the
// same 360/n spacing the source mockup uses for its own n nodes - rather
// than clustering them into one quadrant.
const ANGLE_STEP = 360 / WINDOW_SIZE;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// distance 0 = current (rightmost, angle 0° = straight right), distance 3 =
// the oldest stage still in the window (three quarter-turns counter-
// clockwise from current) - so the ring's 4 equidistant slots always end
// with the current stage on the right.
function nodePosition(distance: number): { left: number; top: number } {
  const rad = (distance * ANGLE_STEP * Math.PI) / 180;
  const x = CENTER + NODE_RADIUS * Math.cos(rad);
  const y = CENTER - NODE_RADIUS * Math.sin(rad);
  return { left: x - NODE_SIZE / 2, top: y - NODE_SIZE / 2 };
}

export function PresentationDialLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: PresentationDialLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const total = content.stages.length;

  function goTo(index: number) {
    if (busy || index < 0 || index >= total) return;
    setBusy(true);
    setCollapsed(true);
    setTimeout(() => {
      setCurrent(index);
      if (!seen.has(index)) {
        const next = new Set(seen).add(index);
        setSeen(next);
        if (!isComplete && next.size === total) onComplete();
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setCollapsed(false));
      });
      setTimeout(() => setBusy(false), 350);
    }, 340);
  }

  const windowStart = Math.max(0, current - (WINDOW_SIZE - 1));
  const windowIndices: number[] = [];
  for (let i = current; i >= windowStart; i--) windowIndices.push(i);

  const stage = content.stages[current];

  return (
    <div className="presentationdial-lesson">
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

        <div className="presentationdial-lesson-centerzone">
          <div className="presentationdial-lesson-ring" />
          {windowIndices.map((i, distance) => {
            const { left, top } = nodePosition(distance);
            return (
              <div
                key={i}
                className={`presentationdial-lesson-node${i === current ? " active" : ""}`}
                style={{ left: `${left}px`, top: `${top}px` }}
                aria-hidden="true"
              >
                {pad(i + 1)}
              </div>
            );
          })}
          <div className={`presentationdial-lesson-card${collapsed ? " is-collapsed" : ""}`}>
            <span className="presentationdial-lesson-counter">
              {pad(current + 1)} / {pad(total)}
            </span>
            <h3 className="presentationdial-lesson-title">{stage.title}</h3>
            <p className="presentationdial-lesson-body">{stage.body}</p>
          </div>
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
