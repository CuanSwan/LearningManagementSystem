import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import type { Course, LearningPath, Module } from "../types.js";
import { getCourse, getProgress, listLearningPaths, listModulesByCourse } from "../api.js";
import { isCourseAccessible } from "../access.js";
import { useAuth } from "../auth.js";
import { BackButton } from "../components/BackButton.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { CourseSideMenu } from "../components/CourseSideMenu.js";
import { isModuleComplete, isModuleLocked } from "../courseProgress.js";
import { describeLesson } from "../lessonTemplates.js";
import { daysRemainingLabel } from "../membership.js";
import { Theme, themeStyle } from "../theme.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

const IN_PROGRESS_COLOR = "#e8862f";
const LOCKED_COLOR = "#9ca3af";

export function StudentCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId).then(setCourse);
    listLearningPaths().then(setLearningPaths);
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
  }, [courseId]);

  const accessible = !user || isCourseAccessible(user, courseId!, learningPaths);

  useEffect(() => {
    if (!courseId || !accessible) return;
    listModulesByCourse(courseId).then((list) =>
      setModules(
        list
          .filter((m) => m.status === "published")
          .map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.order - b.order) }))
      )
    );
    // learningPaths only affects whether this effect *runs*, not what it fetches -
    // re-running it every time the path list reference changes would be pointless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, accessible]);

  if (!course) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);

  if (!accessible) {
    return (
      <main className="student-view course-page" style={themeStyle(resolved)}>
        <Breadcrumb items={[{ label: "Courses", to: "/courses" }, { label: course.title }]} />
        <BackButton to="/courses" label="Back to courses" />
        <h1>{course.title}</h1>
        <p className="access-restricted-notice">
          You don&apos;t have access to this course yet - ask an admin to assign it to you.
        </p>
      </main>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalCompleted = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => completedIds.has(l.lessonId)).length,
    0
  );

  return (
    <>
      <CourseSideMenu courseId={courseId!} />
      <main className="student-view course-page" style={themeStyle(resolved)}>
        <Breadcrumb items={[{ label: "Courses", to: "/courses" }, { label: course.title }]} />
        <BackButton to="/courses" label="Back to courses" />
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

      {user?.membershipExpiresAt !== undefined && (
        <p className="membership-countdown">{daysRemainingLabel(user.membershipExpiresAt)}</p>
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
            const locked = isModuleLocked(modules, index, completedIds);
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
                            <span className="timeline-step-bullet" aria-hidden="true">
                              {isComplete ? "✓" : "•"}
                            </span>
                            <span className="timeline-step-preview">{truncate(describeLesson(lesson), 70)}</span>
                            <span className="timeline-step-number">{lessonIndex + 1}</span>
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
    </>
  );
}
