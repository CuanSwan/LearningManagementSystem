import { useEffect, useRef, useState } from "react";
import { useDisplayPreference } from "../displayPreference.js";

// A single floating entry point for accessibility/display settings, fixed to
// the bottom-left corner so it's reachable from every page without crowding
// the top bar. Reading mode is the only section today, but the panel is
// built to grow - add another <div className="accessibility-menu-section">
// (font size, contrast, motion, etc.) without needing a new place to put it.
export function AccessibilityMenu() {
  const { mode, choose } = useDisplayPreference();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="accessibility-menu" ref={containerRef}>
      {open && (
        <div className="accessibility-menu-panel" role="menu" aria-label="Accessibility and display settings">
          <div className="accessibility-menu-section">
            <span className="accessibility-menu-section-label">Reading Mode</span>
            <div className="display-toggle" role="group" aria-label="Lesson display">
              <button type="button" className={mode === "vertical" ? "active" : ""} onClick={() => choose("vertical")}>
                List
              </button>
              <button type="button" className={mode === "carousel" ? "active" : ""} onClick={() => choose("carousel")}>
                Carousel
              </button>
              <button
                type="button"
                className={mode === "accessible" ? "active" : ""}
                onClick={() => choose("accessible")}
              >
                Accessible
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        className="accessibility-menu-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Accessibility and display settings"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}
