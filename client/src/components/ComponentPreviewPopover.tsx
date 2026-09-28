import { createPortal } from "react-dom";
import type { Lesson, LessonType } from "../types.js";
import { LessonRenderer } from "./LessonRenderer.js";

const POPOVER_WIDTH = 260;
const POPOVER_HEIGHT = 200;
const CANVAS_WIDTH = 520;
const SCALE = POPOVER_WIDTH / CANVAS_WIDTH;
const MARGIN = 8;

// The scroll-tree lesson type drives itself off real page scroll position
// (see TreeScrubLesson) via window-level wheel/touch/keydown listeners that
// stay installed for as long as it's mounted - fine for the one real
// instance of it inside an actual lesson, but mounting and unmounting one
// on every hover risks it capturing scroll input that has nothing to do
// with it. It gets a static fallback here instead of a live render.
function TreeScrubPreviewFallback() {
  return (
    <div className="library-item-preview-fallback">
      <p>A tree that grows in as the page scrolls.</p>
      <p>Live preview isn&rsquo;t available here - see it in the actual lesson.</p>
    </div>
  );
}

// Renders a small, non-interactive live preview of a lesson type near
// wherever its component-library item is being hovered. Rendered into
// document.body via a portal rather than absolutely positioned in place -
// the library panel it lives in clips overflow for its own scrollbar, which
// would otherwise crop the popover instead of letting it float free.
export function ComponentPreviewPopover({ type, lesson, anchorRect }: { type: LessonType; lesson: Lesson; anchorRect: DOMRect }) {
  const top = Math.min(Math.max(anchorRect.top, MARGIN), window.innerHeight - POPOVER_HEIGHT - MARGIN);
  const left = Math.max(anchorRect.left - POPOVER_WIDTH - MARGIN, MARGIN);

  return createPortal(
    <div className="library-item-preview-popover" style={{ top, left, width: POPOVER_WIDTH, height: POPOVER_HEIGHT }}>
      {type === "treeScrub" ? (
        <TreeScrubPreviewFallback />
      ) : (
        <div className="library-item-preview-canvas" style={{ width: CANVAS_WIDTH, transform: `scale(${SCALE})` }}>
          <LessonRenderer lesson={lesson} />
        </div>
      )}
    </div>,
    document.body
  );
}
