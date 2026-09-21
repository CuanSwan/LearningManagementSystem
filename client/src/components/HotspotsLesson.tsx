import { useState } from "react";
import type { HotspotsLesson as HotspotsLessonType } from "../types.js";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function HotspotsLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: HotspotsLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const total = content.tiles.length;

  function toggle(index: number) {
    setActive(active === index ? null : index);
    if (seen.has(index)) return;
    const next = new Set(seen).add(index);
    setSeen(next);
    if (!isComplete && next.size === total) onComplete();
  }

  return (
    <div className="hotspots-lesson">
      <div className="hotspots-lesson-grid" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {content.tiles.map((tile, i) => {
          const isActive = active === i;
          const isFirst = i === 0;
          const isLast = i === total - 1;
          const popoverStyle: { left?: string; right?: string; transform?: string } = isFirst
            ? { left: "0" }
            : isLast
              ? { right: "0" }
              : { left: "50%", transform: "translateX(-50%)" };
          return (
            <div key={i} className="hotspots-lesson-tile-wrap">
              {isActive && (
                <div className="hotspots-lesson-popover" style={popoverStyle}>
                  <span className="hotspots-lesson-popover-label">Point {pad(i + 1)}</span>
                  <p className="hotspots-lesson-popover-body">{tile.body}</p>
                  <p className="hotspots-lesson-popover-example">{tile.example}</p>
                </div>
              )}
              <button
                type="button"
                className={`hotspots-lesson-tile${isActive ? " active" : ""}`}
                onClick={() => toggle(i)}
                aria-expanded={isActive}
              >
                {tile.title}
              </button>
              <span className="hotspots-lesson-tile-index">{pad(i + 1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
