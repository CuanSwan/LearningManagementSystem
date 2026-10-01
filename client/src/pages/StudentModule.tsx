import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Course, Lesson, Module } from "../types.js";
import { getCourse, getModule, getProgress, listModulesByCourse, setLessonProgress } from "../api.js";
import { BackButton } from "../components/BackButton.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { CourseSideMenu } from "../components/CourseSideMenu.js";
import { LessonCarousel } from "../components/LessonCarousel.js";
import { StudentLessonBlock } from "../components/StudentLessonBlock.js";
import { useAuth } from "../auth.js";
import { isModuleLocked } from "../courseProgress.js";
import { useDisplayPreference } from "../displayPreference.js";
import { Theme, themeStyle } from "../theme.js";
import { toTitleCase } from "../textCase.js";

// Guards against lessons saved before `title` was required - older records
// can still persist without one, and this renders a placeholder instead of
// crashing on `text.length`.
function truncate(text: string | undefined, maxLength: number): string {
  if (!text) return "Untitled lesson";
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

const LESSON_HASH_PREFIX = "#lesson-";

export function StudentModule() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeLessonId = location.hash.startsWith(LESSON_HASH_PREFIX)
    ? location.hash.slice(LESSON_HASH_PREFIX.length)
    : undefined;
  const [course, setCourse] = useState<Course | null>(null);
  const [foundModule, setModule] = useState<Module | null>(null);
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentLessonPreview, setCurrentLessonPreview] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const { mode } = useDisplayPreference();

  const handleCurrentLessonChange = useCallback((lesson: Lesson) => {
    setCurrentLessonPreview(truncate(lesson.title && toTitleCase(lesson.title), 40));
  }, []);

  useEffect(() => {
    if (!courseId || !moduleId) return;
    getCourse(courseId).then(setCourse);
    getModule(moduleId)
      .then(setModule)
      .catch((err) => setAccessError(err instanceof Error ? err.message : "Couldn't load this module."));
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
    listModulesByCourse(courseId)
      .then((list) => setCourseModules(list.filter((m) => m.status === "published")))
      .catch(() => {});
  }, [courseId, moduleId]);

  // Deep-linking to a specific lesson (from the course side menu) only
  // applies in the vertical list layout, where every lesson is in the DOM
  // at once - the carousel gets the same target lesson via its own
  // initialLessonId prop below instead, since it renders one at a time.
  useEffect(() => {
    if (!activeLessonId || mode === "carousel" || mode === "accessible") return;
    document.getElementById(`lesson-${activeLessonId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeLessonId, mode, foundModule]);

  if (accessError) return <p className="access-restricted-notice">{accessError}</p>;

  async function markComplete(lessonId: string) {
    if (!foundModule || !courseId || !moduleId) return;
    const result = await setLessonProgress(lessonId, true, { courseId, moduleId });
    setCompletedIds(new Set(result.completedLessonIds));
  }

  if (!course || !foundModule) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);
  const orderedLessons = [...foundModule.lessons].sort((a, b) => a.order - b.order);
  const completedCount = orderedLessons.filter((l) => completedIds.has(l.lessonId)).length;
  const moduleIndex = courseModules.findIndex((m) => m.moduleId === moduleId);
  const nextModule = moduleIndex >= 0 ? (courseModules[moduleIndex + 1] ?? null) : null;
  // Same rule CourseSideMenu/StudentCourse already unlock modules by - always
  // open for an admin/super_admin, gated on this module's completion for a
  // student (which this module being `moduleComplete` already implies).
  const nextModuleReachable =
    nextModule !== null && !isModuleLocked(courseModules, moduleIndex + 1, completedIds, user?.role ?? "student");
  const moduleComplete = orderedLessons.length > 0 && completedCount === orderedLessons.length;
  // Drives the inline "keep going" button shown once every lesson in this
  // module is done - into the next module if one's reachable, or back to
  // the course overview if this was the last one. No popup: it just appears
  // where the student already is, at the end of the carousel or the list.
  const continueAction = !moduleComplete
    ? undefined
    : nextModule && nextModuleReachable
      ? {
          label: `Next: ${nextModule.seed.title}`,
          onClick: () => navigate(`/courses/${courseId}/modules/${nextModule.moduleId}`),
        }
      : !nextModule
        ? { label: "Back to course overview", onClick: () => navigate(`/courses/${courseId}`) }
        : undefined;
  // Accessible mode reuses the carousel's one-lesson-at-a-time layout; only the
  // font/sizing changes, via the accessible-mode class applied below.
  const usesCarousel = mode === "carousel" || mode === "accessible";
  const breadcrumbItems = [
    { label: "Courses", to: "/courses" },
    { label: course.title, to: `/courses/${courseId}` },
    { label: foundModule.seed.title, to: `/courses/${courseId}/modules/${moduleId}` },
    ...(usesCarousel && currentLessonPreview ? [{ label: currentLessonPreview }] : []),
  ];

  return (
    <>
      <CourseSideMenu courseId={courseId!} activeModuleId={moduleId} activeLessonId={activeLessonId} />
      <main
        className={`student-view module-page${mode === "accessible" ? " accessible-mode" : ""}`}
        style={themeStyle(resolved)}
      >
      <Breadcrumb items={breadcrumbItems} />
      <BackButton to={`/courses/${courseId}`} label={`Back to ${course.title}`} />
      <h1>{foundModule.seed.title}</h1>
      <p className="course-description">{foundModule.seed.objective}</p>

      {usesCarousel ? (
        <LessonCarousel
          // Remounts (and so recomputes its starting index) whenever the
          // target module or lesson changes, since the carousel's index is
          // otherwise plain internal state that a prop change alone can't
          // reset once already mounted.
          key={`${moduleId}-${activeLessonId ?? "start"}`}
          lessons={orderedLessons}
          completedIds={completedIds}
          initialLessonId={activeLessonId}
          onComplete={markComplete}
          onCurrentLessonChange={handleCurrentLessonChange}
          continueAction={continueAction}
        />
      ) : (
        <>
          <div className="progress-summary">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${orderedLessons.length ? (completedCount / orderedLessons.length) * 100 : 0}%` }}
              />
            </div>
            <span>
              {completedCount} of {orderedLessons.length} lessons complete
            </span>
          </div>

          <div className="student-lessons">
            {orderedLessons.map((lesson) => (
              <div key={lesson.lessonId} id={`lesson-${lesson.lessonId}`}>
                <StudentLessonBlock
                  lesson={lesson}
                  isComplete={completedIds.has(lesson.lessonId)}
                  onComplete={() => markComplete(lesson.lessonId)}
                />
              </div>
            ))}
          </div>

          {continueAction && (
            <div className="module-complete-cta">
              <button type="button" onClick={continueAction.onClick}>
                {continueAction.label} &rarr;
              </button>
            </div>
          )}
        </>
      )}
      </main>
    </>
  );
}
