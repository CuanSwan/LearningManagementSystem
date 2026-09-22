import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Module } from "../types.js";
import { getProgress, listModulesByCourse } from "../api.js";
import { isModuleComplete, isModuleLocked } from "../courseProgress.js";
import { describeLesson } from "../lessonTemplates.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

// Floats fixed to the left edge of the viewport, the same "collapsible
// overlay" pattern as the admin tools panel - course/module pages fill the
// full page width with no spare margin to dock into, so there's nowhere to
// sit in-flow without squeezing the reading content. Defaults to collapsed,
// unlike the admin panel: a student arriving to read shouldn't have their
// content covered before they've asked for the nav tree.
export function CourseSideMenu({
  courseId,
  activeModuleId,
  activeLessonId,
}: {
  courseId: string;
  activeModuleId?: string;
  activeLessonId?: string;
}) {
  const [collapsed, setCollapsed] = useState(true);
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
    <div className={`course-side-menu${collapsed ? " is-collapsed" : ""}`}>
      <button
        type="button"
        className="course-side-menu-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        {collapsed ? "Contents ›" : "‹ Contents"}
      </button>
      {!collapsed && (
        <nav className="course-side-menu-body" aria-label="Course contents">
          {modules.map((module, index) => {
            const complete = isModuleComplete(module, completedIds);
            const locked = isModuleLocked(modules, index, completedIds);
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
        </nav>
      )}
    </div>
  );
}
