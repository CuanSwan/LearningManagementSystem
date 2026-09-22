import { useState } from "react";
import type { Lesson } from "../types.js";
import { ComponentLibrary } from "./ComponentLibrary.js";
import { LibrarySidebar } from "./LibrarySidebar.js";

// Docked to the right edge of the viewport (fixed, not sticky-in-flow)
// so a long lesson list gets the module editor's full width instead of
// sharing it with two 220-260px columns, and the panel itself floats
// above the lesson list rather than scrolling away with it. Collapses to
// a small edge tab so it never permanently covers whatever's underneath.
export function AdminToolsPanel({
  savedLessons,
  onDropRemove,
  onImportLesson,
}: {
  savedLessons: Lesson[];
  onDropRemove: (lessonId: string) => void;
  onImportLesson: (lesson: Lesson) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-tools-panel${collapsed ? " is-collapsed" : ""}`}>
      <button
        type="button"
        className="admin-tools-panel-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        {collapsed ? "‹ Tools" : "Tools ›"}
      </button>
      {!collapsed && (
        <div className="admin-tools-panel-body">
          <ComponentLibrary savedLessons={savedLessons} onDropRemove={onDropRemove} />
          <LibrarySidebar onImportLesson={onImportLesson} />
        </div>
      )}
    </div>
  );
}
