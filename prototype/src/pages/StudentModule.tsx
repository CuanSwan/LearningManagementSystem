import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Theme, type Course, type Lesson, type Module } from "@lms/shared";
import { getCourse, getModule, getProgress, setLessonProgress } from "../api.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { LessonCarousel } from "../components/LessonCarousel.js";
import { StudentLessonBlock } from "../components/StudentLessonBlock.js";
import { useDisplayPreference } from "../displayPreference.js";
import { describeLesson } from "../lessonTemplates.js";
import { themeStyle } from "../theme.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

export function StudentModule() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [foundModule, setModule] = useState<Module | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentLessonPreview, setCurrentLessonPreview] = useState<string | null>(null);
  const { mode } = useDisplayPreference();

  const handleCurrentLessonChange = useCallback((lesson: Lesson) => {
    setCurrentLessonPreview(truncate(describeLesson(lesson), 40));
  }, []);

  useEffect(() => {
    if (!courseId || !moduleId) return;
    getCourse(courseId).then(setCourse);
    getModule(moduleId).then(setModule);
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
  }, [courseId, moduleId]);

  async function markComplete(lessonId: string) {
    const result = await setLessonProgress(lessonId, true);
    setCompletedIds(new Set(result.completedLessonIds));
  }

  if (!course || !foundModule) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);
  const orderedLessons = [...foundModule.lessons].sort((a, b) => a.order - b.order);
  const completedCount = orderedLessons.filter((l) => completedIds.has(l.lessonId)).length;
  const usesCarousel = mode === "carousel";
  const breadcrumbItems = [
    { label: "Courses", to: "/" },
    { label: course.title, to: `/courses/${courseId}` },
    { label: foundModule.seed.title, to: `/courses/${courseId}/modules/${moduleId}` },
    ...(usesCarousel && currentLessonPreview ? [{ label: currentLessonPreview }] : []),
  ];

  return (
    <main className="student-view module-page" style={themeStyle(resolved)}>
      <Breadcrumb items={breadcrumbItems} />
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
    </main>
  );
}
