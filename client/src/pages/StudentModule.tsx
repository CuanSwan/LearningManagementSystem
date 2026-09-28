import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Course, Lesson, LessonReviewStatus, Module } from "../types.js";
import { getCourse, getModule, getProgress, listModulesByCourse, setLessonProgress } from "../api.js";
import { useAuth } from "../auth.js";
import { BackButton } from "../components/BackButton.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { CourseSideMenu } from "../components/CourseSideMenu.js";
import { LessonCarousel } from "../components/LessonCarousel.js";
import { ModuleCompleteModal } from "../components/ModuleCompleteModal.js";
import { StudentLessonBlock } from "../components/StudentLessonBlock.js";
import { isModuleLocked } from "../courseProgress.js";
import { useDisplayPreference } from "../displayPreference.js";
import { describeLesson } from "../lessonTemplates.js";
import { Theme, themeStyle } from "../theme.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

const LESSON_HASH_PREFIX = "#lesson-";

export function StudentModule() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const { user } = useAuth();
  const isReviewer = user?.role === "reviewer";
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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const { mode } = useDisplayPreference();

  const handleCurrentLessonChange = useCallback((lesson: Lesson) => {
    setCurrentLessonPreview(truncate(describeLesson(lesson), 40));
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
    // A reviewer is browsing content, not taking the course - nothing about
    // their view gets recorded, so the lesson-progress endpoint never gets
    // called for them (see also the hidden progress bar below).
    if (isReviewer || !foundModule || !courseId || !moduleId) return;
    const lessonIds = foundModule.lessons.map((l) => l.lessonId);
    const wasComplete = lessonIds.length > 0 && lessonIds.every((id) => completedIds.has(id));

    const result = await setLessonProgress(lessonId, true, { courseId, moduleId });
    const nextCompleted = new Set(result.completedLessonIds);
    setCompletedIds(nextCompleted);

    const nowComplete = lessonIds.length > 0 && lessonIds.every((id) => nextCompleted.has(id));
    if (nowComplete && !wasComplete) setShowCompleteModal(true);
  }

  // Keeps the displayed status badge (and which review actions show up) in
  // sync immediately after a comment/submit/clear action, without needing
  // a full refetch of the module.
  function handleReviewStatusChange(lessonId: string, reviewStatus: LessonReviewStatus | undefined) {
    setModule((prev) =>
      prev
        ? { ...prev, lessons: prev.lessons.map((l) => (l.lessonId === lessonId ? { ...l, reviewStatus } : l)) }
        : prev
    );
  }

  if (!course || !foundModule) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);
  const orderedLessons = [...foundModule.lessons].sort((a, b) => a.order - b.order);
  const completedCount = orderedLessons.filter((l) => completedIds.has(l.lessonId)).length;
  const moduleIndex = courseModules.findIndex((m) => m.moduleId === moduleId);
  const nextModule = moduleIndex >= 0 ? (courseModules[moduleIndex + 1] ?? null) : null;
  // Same rule CourseSideMenu/StudentCourse already unlock modules by - always
  // open for a reviewer/admin/super_admin, gated on this module's completion
  // for a student. Lets the carousel's last-lesson Next button carry a
  // student straight into the next module the moment they've earned it,
  // instead of only offering that via the completion modal below.
  const nextModuleReachable =
    nextModule !== null && !isModuleLocked(courseModules, moduleIndex + 1, completedIds, user?.role ?? "student");
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
          moduleId={moduleId!}
          lessons={orderedLessons}
          completedIds={completedIds}
          initialLessonId={activeLessonId}
          onComplete={markComplete}
          onCurrentLessonChange={handleCurrentLessonChange}
          onReviewStatusChange={handleReviewStatusChange}
          nextModuleTitle={nextModule?.seed.title}
          onNextModule={
            nextModuleReachable && nextModule ? () => navigate(`/courses/${courseId}/modules/${nextModule.moduleId}`) : undefined
          }
        />
      ) : (
        <>
          {!isReviewer && (
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
          )}

          <div className="student-lessons">
            {orderedLessons.map((lesson) => (
              <div key={lesson.lessonId} id={`lesson-${lesson.lessonId}`}>
                <StudentLessonBlock
                  moduleId={moduleId!}
                  lesson={lesson}
                  isComplete={completedIds.has(lesson.lessonId)}
                  onComplete={() => markComplete(lesson.lessonId)}
                  onReviewStatusChange={handleReviewStatusChange}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {showCompleteModal && courseId && (
        <ModuleCompleteModal
          moduleTitle={foundModule.seed.title}
          nextModule={nextModule}
          courseId={courseId}
          onClose={() => setShowCompleteModal(false)}
        />
      )}
      </main>
    </>
  );
}
