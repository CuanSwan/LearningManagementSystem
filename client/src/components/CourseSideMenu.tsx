import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Module } from "../types.js";
import { getProgress, listModulesByCourse } from "../api.js";
import { useAuth } from "../auth.js";
import { isModuleComplete, isModuleLocked } from "../courseProgress.js";
import { describeLesson } from "../lessonTemplates.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

// A full-height drawer, fixed to the left edge of the viewport, that
// slides in and pushes the reading content right (via a CSS sibling
// selector matching .course-page/.module-page - see App.css) rather than
// floating as an overlay on top of it. The toggle is a separate element
// (not inside the sliding drawer) so it stays reachable - and rides along
// the drawer's edge - regardless of open state. Defaults to closed: a
// student arriving to read shouldn't have their content shoved aside
// before they've asked for the nav tree.
export function CourseSideMenu({
  courseId,
  activeModuleId,
  activeLessonId,
}: {
  courseId: string;
  activeModuleId?: string;
  activeLessonId?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    listModulesByCourse(courseId)
      .then((list) =>
        setModules(
          list
            .filter((m) => m.status === "published")
            .map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.order - b.order) }))
        )
      )
      .catch(() => {});
    getProgress()
      .then((p) => setCompletedIds(new Set(p.completedLessonIds)))
      .catch(() => {});
  }, [courseId]);

  if (modules.length === 0) return null;

  return (
    <>
      <nav className={`course-side-menu${open ? " is-open" : ""}`} aria-label="Course contents">
        <div className="course-side-menu-body">
          {modules.map((module, index) => {
            const complete = isModuleComplete(module, completedIds);
            const locked = isModuleLocked(modules, index, completedIds, user?.role ?? "student");
            const isActiveModule = module.moduleId === activeModuleId;
            // With no active module (the course overview page has no single
            // "current" module in context), default-open whichever module
            // the student would naturally go to next - the sequential
            // unlock rule guarantees at most one module is ever both
            // unlocked and incomplete at a time, so this never opens more
            // than one.
            const isNextUp = !activeModuleId && !locked && !complete;
            return (
              <details
                key={module.moduleId}
                className={`course-side-menu-module${locked ? " is-locked" : ""}`}
                open={isActiveModule || isNextUp}
              >
                <summary>
                  <span className="course-side-menu-module-title">{module.seed.title}</span>
                  {complete && <span className="course-side-menu-check" aria-label="Complete">&#10003;</span>}
                  {locked && <span className="course-side-menu-lock" aria-label="Locked">&#128274;</span>}
                </summary>
                {module.lessons.length === 0 ? (
                  <p className="course-side-menu-empty">No lessons yet</p>
                ) : locked ? (
                  <ul className="course-side-menu-lessons">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.lessonId} className="course-side-menu-lesson is-locked">
                        {truncate(describeLesson(lesson), 40)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="course-side-menu-lessons">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.lessonId}>
                        <Link
                          to={`/courses/${courseId}/modules/${module.moduleId}#lesson-${lesson.lessonId}`}
                          className={`course-side-menu-lesson${
                            lesson.lessonId === activeLessonId ? " is-active" : ""
                          }`}
                        >
                          {completedIds.has(lesson.lessonId) && (
                            <span className="course-side-menu-check" aria-label="Complete">&#10003;</span>
                          )}
                          {truncate(describeLesson(lesson), 40)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            );
          })}
        </div>
      </nav>
      <button
        type="button"
        className={`course-side-menu-toggle${open ? " is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "‹ Contents" : "Contents ›"}
      </button>
    </>
  );
}
