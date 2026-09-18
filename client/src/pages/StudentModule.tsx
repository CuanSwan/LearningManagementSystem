import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Course, Lesson, Module } from "../types.js";
import { getCourse, getModule, getProgress, listModulesByCourse, setLastVisited, setLessonProgress } from "../api.js";
import { BackButton } from "../components/BackButton.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { LessonCarousel } from "../components/LessonCarousel.js";
import { ModuleCompleteModal } from "../components/ModuleCompleteModal.js";
import { StudentLessonBlock } from "../components/StudentLessonBlock.js";
import { useDisplayPreference } from "../displayPreference.js";
import { describeLesson } from "../lessonTemplates.js";
import { Theme, themeStyle } from "../theme.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

export function StudentModule() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
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
      .then((m) => {
        setModule(m);
        setLastVisited(courseId, moduleId).catch(() => {});
      })
      .catch((err) => setAccessError(err instanceof Error ? err.message : "Couldn't load this module."));
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
    listModulesByCourse(courseId)
      .then((list) => setCourseModules(list.filter((m) => m.status === "published")))
      .catch(() => {});
  }, [courseId, moduleId]);

  if (accessError) return <p className="access-restricted-notice">{accessError}</p>;

  async function markComplete(lessonId: string) {
    if (!foundModule) return;
    const lessonIds = foundModule.lessons.map((l) => l.lessonId);
    const wasComplete = lessonIds.length > 0 && lessonIds.every((id) => completedIds.has(id));

    const result = await setLessonProgress(lessonId, true);
    const nextCompleted = new Set(result.completedLessonIds);
    setCompletedIds(nextCompleted);

    const nowComplete = lessonIds.length > 0 && lessonIds.every((id) => nextCompleted.has(id));
    if (nowComplete && !wasComplete) setShowCompleteModal(true);
  }

  if (!course || !foundModule) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);
  const orderedLessons = [...foundModule.lessons].sort((a, b) => a.order - b.order);
  const completedCount = orderedLessons.filter((l) => completedIds.has(l.lessonId)).length;
  const moduleIndex = courseModules.findIndex((m) => m.moduleId === moduleId);
  const nextModule = moduleIndex >= 0 ? (courseModules[moduleIndex + 1] ?? null) : null;
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
          lessons={orderedLessons}
          completedIds={completedIds}
          onComplete={markComplete}
          onCurrentLessonChange={handleCurrentLessonChange}
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
              <StudentLessonBlock
                key={lesson.lessonId}
                lesson={lesson}
                isComplete={completedIds.has(lesson.lessonId)}
                onComplete={() => markComplete(lesson.lessonId)}
              />
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
  );
}
