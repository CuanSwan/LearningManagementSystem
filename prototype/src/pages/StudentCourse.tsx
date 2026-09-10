import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme, type Course, type Module } from "@lms/shared";
import { getCourse, getProgress, listModulesByCourse } from "../api.js";
import { describeLesson, lessonTypeLabel } from "../lessonTemplates.js";
import { themeStyle } from "../theme.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

export function StudentCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId).then(setCourse);
    listModulesByCourse(courseId).then((list) =>
      setModules(
        list
          .filter((m) => m.status === "published")
          .map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.order - b.order) }))
      )
    );
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
  }, [courseId]);

  if (!course) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalCompleted = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => completedIds.has(l.lessonId)).length,
    0
  );

  return (
    <main className="student-view" style={themeStyle(resolved)}>
      <p className="breadcrumb">
        <Link to="/">&larr; All courses</Link>
      </p>
      <h1>{course.title}</h1>
      {course.description && <p className="course-description">{course.description}</p>}

      {totalLessons > 0 && (
        <div className="progress-summary">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${(totalCompleted / totalLessons) * 100}%` }} />
          </div>
          <span>
            {totalCompleted} of {totalLessons} lessons complete
          </span>
        </div>
      )}

      {modules.length === 0 ? (
        <p>No published modules yet.</p>
      ) : (
        <ol className="tree-path">
          {modules.map((module, index) => {
            const moduleCompleted = module.lessons.filter((l) => completedIds.has(l.lessonId)).length;
            const moduleTotal = module.lessons.length;
            const pct = moduleTotal ? (moduleCompleted / moduleTotal) * 100 : 0;
            const isModuleComplete = moduleTotal > 0 && moduleCompleted === moduleTotal;

            return (
              <li key={module.moduleId} className={`tree-node ${index % 2 === 0 ? "side-left" : "side-right"}`}>
                <span
                  className={`tree-node-dot${isModuleComplete ? " is-complete" : ""}`}
                  style={{ "--progress": pct } as CSSProperties}
                  aria-hidden="true"
                />
                <div className="tree-node-card">
                  <Link to={`/courses/${courseId}/modules/${module.moduleId}`} className="timeline-module-link">
                    <h2>{module.seed.title}</h2>
                    <p>{module.seed.objective}</p>
                  </Link>

                  {moduleTotal > 0 && (
                    <p className="module-progress-label">
                      {moduleCompleted} of {moduleTotal} complete
                    </p>
                  )}

                  {module.lessons.length > 0 && (
                    <ol className="timeline-steps">
                      {module.lessons.map((lesson) => {
                        const isComplete = completedIds.has(lesson.lessonId);
                        return (
                          <li
                            key={lesson.lessonId}
                            className={`timeline-step${isComplete ? " is-complete" : ""}`}
                          >
                            <span className="timeline-step-type">{lessonTypeLabel(lesson.type)}</span>
                            <span className="timeline-step-preview">{truncate(describeLesson(lesson), 70)}</span>
                            {isComplete && <span className="timeline-step-check">✓</span>}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
