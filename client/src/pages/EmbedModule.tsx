import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { Course, Module } from "../types.js";
import { embedLogin, getCourse, getModule, getProgress, setLessonProgress } from "../api.js";
import { StudentLessonBlock } from "../components/StudentLessonBlock.js";
import { Theme, themeStyle } from "../theme.js";

// The view an embed link (see api.ts's embedLogin) opens on. Deliberately
// self-contained - no TopBar, no CourseSideMenu, no link back to a catalog
// or any other module. A visitor who edits the URL/devtools can still reach
// other content their embed session was granted (see the design discussion
// this implements), but nothing in this page points them there itself.
export function EmbedModule() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId || !moduleId) {
      setError("This link is missing a course or module.");
      setStatus("error");
      return;
    }
    if (!email) {
      setError("This link is missing a student email.");
      setStatus("error");
      return;
    }

    let cancelled = false;
    embedLogin(email, courseId, moduleId)
      .then(() => Promise.all([getCourse(courseId), getModule(moduleId), getProgress()]))
      .then(([loadedCourse, loadedModule, progress]) => {
        if (cancelled) return;
        setCourse(loadedCourse);
        setModule(loadedModule);
        setCompletedIds(new Set(progress.completedLessonIds));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "This content isn't available.");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, moduleId, email]);

  async function markComplete(lessonId: string) {
    const result = await setLessonProgress(lessonId, true, { courseId: courseId!, moduleId: moduleId! });
    setCompletedIds(new Set(result.completedLessonIds));
  }

  if (status === "loading") return <p className="embed-status">Loading...</p>;
  if (status === "error" || !course || !module) {
    return <p className="embed-status">{error ?? "This content isn't available."}</p>;
  }

  const resolved = Theme.default().withOverrides(course.theme);
  const orderedLessons = [...module.lessons].sort((a, b) => a.order - b.order);
  const completedCount = orderedLessons.filter((l) => completedIds.has(l.lessonId)).length;

  return (
    <main className="student-view module-page embed-module" style={themeStyle(resolved)}>
      <h1>{module.seed.title}</h1>
      <p className="course-description">{module.seed.objective}</p>

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
    </main>
  );
}
