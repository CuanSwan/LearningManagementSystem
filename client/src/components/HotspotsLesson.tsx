import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { HotspotsLesson as HotspotsLessonType } from "../types.js";
import { RichTextView } from "./RichTextView.js";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

const POPOVER_WIDTH = 240;
const POPOVER_GAP = 14;
const VIEWPORT_MARGIN = 16;

// Rendered into document.body via a portal, positioned from the tile's own
// bounding rect, rather than absolutely positioned in place - the carousel
// slide it can live in scrolls its own content (.lesson-carousel
// .student-lesson has overflow-y: auto), which would otherwise clip the
// popover the moment it pops up past the slide's edge instead of letting it
// float free above everything else on the page.
function HotspotPopover({ index, body, example, anchorRect }: { index: number; body: string; example: string; anchorRect: DOMRect }) {
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchorRect.left + anchorRect.width / 2 - POPOVER_WIDTH / 2, window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN)
  );
  const bottom = window.innerHeight - anchorRect.top + POPOVER_GAP;

  return createPortal(
    <div className="hotspots-lesson-popover" style={{ left, bottom, width: POPOVER_WIDTH }}>
      <span className="hotspots-lesson-popover-label">Point {pad(index + 1)}</span>
      <RichTextView className="hotspots-lesson-popover-body" html={body} />
      <RichTextView className="hotspots-lesson-popover-example" html={example} />
    </div>,
    document.body
  );
}

export function HotspotsLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: HotspotsLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
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
      <div className="hotspots-lesson-grid">
        {content.tiles.map((tile, i) => {
          const isActive = active === i;
          const anchor = tileRefs.current[i];
          return (
            <div key={i} className="hotspots-lesson-tile-wrap">
              {isActive && anchor && (
                <HotspotPopover index={i} body={tile.body} example={tile.example} anchorRect={anchor.getBoundingClientRect()} />
              )}
              <button
                ref={(el) => (tileRefs.current[i] = el)}
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
