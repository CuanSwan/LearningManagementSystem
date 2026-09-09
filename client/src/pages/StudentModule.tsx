import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme, type Course, type Module } from "@lms/shared";
import { getCourse, getModule, getProgress, setLessonProgress } from "../api.js";
import { LessonCarousel } from "../components/LessonCarousel.js";
import { StudentLessonBlock } from "../components/StudentLessonBlock.js";
import { useDisplayPreference } from "../displayPreference.js";
import { themeStyle } from "../theme.js";

export function StudentModule() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [foundModule, setModule] = useState<Module | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const { mode } = useDisplayPreference();

  useEffect(() => {
    if (!courseId || !moduleId) return;
    getCourse(courseId).then(setCourse);
    getModule(moduleId).then(setModule);
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
  }, [courseId, moduleId]);

  async function toggleComplete(lessonId: string) {
    const isComplete = completedIds.has(lessonId);
    const result = await setLessonProgress(lessonId, !isComplete);
    setCompletedIds(new Set(result.completedLessonIds));
  }

  if (!course || !foundModule) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);
  const orderedLessons = [...foundModule.lessons].sort((a, b) => a.order - b.order);
  const completedCount = orderedLessons.filter((l) => completedIds.has(l.lessonId)).length;

  return (
    <main className="student-view" style={themeStyle(resolved)}>
      <p className="breadcrumb">
        <Link to={`/courses/${courseId}`}>&larr; {course.title}</Link>
      </p>
      <h1>{foundModule.seed.title}</h1>
      <p className="course-description">{foundModule.seed.objective}</p>

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

      {mode === "carousel" ? (
        <LessonCarousel lessons={orderedLessons} completedIds={completedIds} onToggle={toggleComplete} />
      ) : (
        <div className="student-lessons">
          {orderedLessons.map((lesson) => (
            <StudentLessonBlock
              key={lesson.lessonId}
              lesson={lesson}
              isComplete={completedIds.has(lesson.lessonId)}
              onToggle={() => toggleComplete(lesson.lessonId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
