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
// Spread the 4 dots evenly around the full circle - the same 360/n
// spacing the source mockup uses for its own n nodes - rather than
// clustering them into one quadrant.
const ANGLE_STEP = 360 / WINDOW_SIZE;
// The ring always shows one stage back (top), the current stage (right),
// and two stages ahead (bottom, then left) - so the current position's
// mod-4 base angle lands them there (see nodeBasePosition). A slot whose
// stage index falls outside [0, total) is rendered blank rather than
// omitted, so the ring keeps its 4 fixed positions.
const OFFSETS = [-1, 0, 1, 2];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Each node's own position is fixed by its stage index, never by how far
// it currently is from "current" - it's the wrapping element around all
// of them that rotates (see wrapperRotateDeg below), exactly like the
// source mockup's dial-wrap. That's what makes the surviving nodes swing
// smoothly around the ring each step instead of jumping straight to
// their new spot.
function nodeBasePosition(i: number): { left: number; top: number } {
  const rad = (i * ANGLE_STEP * Math.PI) / 180;
  const x = CENTER + NODE_RADIUS * Math.cos(rad);
  const y = CENTER + NODE_RADIUS * Math.sin(rad);
  return { left: x - NODE_SIZE / 2, top: y - NODE_SIZE / 2 };
}

export function PresentationDialLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: PresentationDialLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [current, setCurrent] = useState(0);
  // The ring starts turning the instant a nav button is clicked, same as
  // the source mockup - only the card's content swap waits for the shrink
  // transition to finish. Tracking the rotation target separately from
  // `current` (which drives the card + which 4 nodes are mounted) is what
  // lets the ring's spin lead the card swap instead of waiting on it.
  const [rotationIndex, setRotationIndex] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const total = content.stages.length;

  function goTo(index: number) {
    if (busy || index < 0 || index >= total) return;
    setBusy(true);
    setRotationIndex(index);
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

  const stage = content.stages[current];

  // Rotating the wrapper by -rotationIndex * ANGLE_STEP brings that
  // stage's own fixed position around to the rightmost slot (see
  // nodeBasePosition) - and every other mounted node along with it,
  // sweeping around the ring rather than teleporting. The label spans
  // counter-rotate by the same amount in reverse so the digits stay
  // upright.
  const wrapperRotateDeg = -rotationIndex * ANGLE_STEP;
  const labelRotateDeg = rotationIndex * ANGLE_STEP;

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
          <div className="presentationdial-lesson-nodes" style={{ transform: `rotate(${wrapperRotateDeg}deg)` }}>
            {OFFSETS.map((offset) => {
              const i = current + offset;
              const valid = i >= 0 && i < total;
              const { left, top } = nodeBasePosition(i);
              return (
                <div
                  key={i}
                  className={`presentationdial-lesson-node${i === current ? " active" : ""}${valid ? "" : " is-blank"}`}
                  style={{ left: `${left}px`, top: `${top}px` }}
                  aria-hidden="true"
                >
                  {valid && <span style={{ transform: `rotate(${labelRotateDeg}deg)` }}>{pad(i + 1)}</span>}
                </div>
              );
            })}
          </div>
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
