import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme, type Course, type Module } from "@lms/shared";
import { getCourse, getProgress, listModulesByCourse } from "../api.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { describeLesson, lessonTypeLabel } from "../lessonTemplates.js";
import { themeStyle } from "../theme.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

const IN_PROGRESS_COLOR = "#e8862f";
const LOCKED_COLOR = "#9ca3af";

function isModuleComplete(module: Module, completedIds: Set<string>): boolean {
  return module.lessons.length > 0 && module.lessons.every((l) => completedIds.has(l.lessonId));
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
    <main className="student-view course-page" style={themeStyle(resolved)}>
      <Breadcrumb items={[{ label: "Courses", to: "/" }, { label: course.title }]} />
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
            const complete = isModuleComplete(module, completedIds);
            const priorModulesComplete = modules.slice(0, index).every((m) => isModuleComplete(m, completedIds));
            const locked = !complete && !priorModulesComplete;
            const accentColor = complete ? resolved.primaryColor : locked ? LOCKED_COLOR : IN_PROGRESS_COLOR;

            const cardContent = (
              <>
                <div className="tree-node-card-header">
                  <h2>{module.seed.title}</h2>
                  {complete && <span className="tree-node-complete-badge">Complete</span>}
                  {locked && <span className="tree-node-locked-badge">Locked</span>}
                </div>
                <p className="tree-node-card-desc">{module.seed.objective}</p>

                {moduleTotal > 0 && (
                  <div className="tree-node-progress">
                    <div className="tree-node-progress-bar">
                      <div className="tree-node-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="tree-node-progress-label">
                      {moduleCompleted} of {moduleTotal} Complete
                    </span>
                  </div>
                )}

                {module.lessons.length > 0 && (
                  <>
                    <hr className="tree-node-divider" />
                    <ol className="timeline-steps">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isComplete = completedIds.has(lesson.lessonId);
                        return (
                          <li
                            key={lesson.lessonId}
                            className={`timeline-step${isComplete ? " is-complete" : ""}`}
                          >
                            <span className="timeline-step-type">{lessonTypeLabel(lesson.type)}</span>
                            <span className="timeline-step-preview">{truncate(describeLesson(lesson), 70)}</span>
                            {isComplete ? (
                              <span className="timeline-step-check">✓</span>
                            ) : (
                              <span className="timeline-step-number">{lessonIndex + 1}</span>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </>
                )}
              </>
            );

            return (
              <li
                key={module.moduleId}
                className="tree-node"
                style={{ "--module-accent": accentColor } as CSSProperties}
              >
                <span
                  className={`tree-node-dot${complete ? " is-complete" : ""}`}
                  style={{ "--progress": pct } as CSSProperties}
                  aria-hidden="true"
                >
                  {!complete && index + 1}
                </span>
                {locked ? (
                  <div className="tree-node-card is-locked" aria-disabled="true">
                    {cardContent}
                  </div>
                ) : (
                  <Link to={`/courses/${courseId}/modules/${module.moduleId}`} className="tree-node-card">
                    {cardContent}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
