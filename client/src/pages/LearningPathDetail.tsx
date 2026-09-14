import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme, type Course, type LearningPath, type Module } from "@lms/shared";
import { getCourse, getLearningPath, getProgress, listModulesByCourse } from "../api.js";
import { Breadcrumb } from "../components/Breadcrumb.js";

const IN_PROGRESS_COLOR = "#e8862f";
const LOCKED_COLOR = "#9ca3af";

function isModuleComplete(module: Module, completedIds: Set<string>): boolean {
  return module.lessons.length > 0 && module.lessons.every((l) => completedIds.has(l.lessonId));
}

function isCourseComplete(modules: Module[], completedIds: Set<string>): boolean {
  return modules.length > 0 && modules.every((m) => isModuleComplete(m, completedIds));
}

export function LearningPathDetail() {
  const { pathId } = useParams<{ pathId: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modulesByCourse, setModulesByCourse] = useState<Record<string, Module[]>>({});
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!pathId) return;
    getLearningPath(pathId).then(async (p) => {
      setPath(p);
      const loadedCourses = await Promise.all(p.courseIds.map((id) => getCourse(id)));
      setCourses(loadedCourses);
      const moduleLists = await Promise.all(
        p.courseIds.map((id) =>
          listModulesByCourse(id).then((list) => list.filter((m) => m.status === "published"))
        )
      );
      const map: Record<string, Module[]> = {};
      p.courseIds.forEach((id, i) => {
        map[id] = moduleLists[i];
      });
      setModulesByCourse(map);
    });
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
  }, [pathId]);

  if (!path) return <p>Loading...</p>;

  const allLessons = courses.flatMap((c) => (modulesByCourse[c.courseId] ?? []).flatMap((m) => m.lessons));
  const totalLessons = allLessons.length;
  const totalCompleted = allLessons.filter((l) => completedIds.has(l.lessonId)).length;

  return (
    <main className="student-view course-page">
      <Breadcrumb items={[{ label: "Learning Paths", to: "/" }, { label: path.title }]} />
      <h1>{path.title}</h1>
      {path.description && <p className="course-description">{path.description}</p>}

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

      {courses.length === 0 ? (
        <p>No courses in this path yet.</p>
      ) : (
        <ol className="tree-path">
          {courses.map((course, index) => {
            const courseModules = modulesByCourse[course.courseId] ?? [];
            const courseLessons = courseModules.flatMap((m) => m.lessons);
            const courseCompleted = courseLessons.filter((l) => completedIds.has(l.lessonId)).length;
            const courseTotal = courseLessons.length;
            const pct = courseTotal ? (courseCompleted / courseTotal) * 100 : 0;
            const complete = isCourseComplete(courseModules, completedIds);
            const priorCoursesComplete = courses
              .slice(0, index)
              .every((c) => isCourseComplete(modulesByCourse[c.courseId] ?? [], completedIds));
            const locked = !complete && !priorCoursesComplete;
            const resolved = Theme.default().withOverrides(course.theme);
            const accentColor = complete ? resolved.primaryColor : locked ? LOCKED_COLOR : IN_PROGRESS_COLOR;

            const cardContent = (
              <>
                <div className="tree-node-card-header">
                  <h2>{course.title}</h2>
                  {complete && <span className="tree-node-complete-badge">Complete</span>}
                  {locked && <span className="tree-node-locked-badge">Locked</span>}
                </div>
                {course.description && <p className="tree-node-card-desc">{course.description}</p>}

                {courseTotal > 0 && (
                  <div className="tree-node-progress">
                    <div className="tree-node-progress-bar">
                      <div className="tree-node-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="tree-node-progress-label">
                      {courseCompleted} of {courseTotal} Complete
                    </span>
                  </div>
                )}

                {courseModules.length > 0 && (
                  <>
                    <hr className="tree-node-divider" />
                    <ol className="timeline-steps">
                      {courseModules.map((module, moduleIndex) => {
                        const moduleComplete = isModuleComplete(module, completedIds);
                        return (
                          <li key={module.moduleId} className={`timeline-step${moduleComplete ? " is-complete" : ""}`}>
                            <span className="timeline-step-type">Module</span>
                            <span className="timeline-step-preview">{module.seed.title}</span>
                            {moduleComplete ? (
                              <span className="timeline-step-check">✓</span>
                            ) : (
                              <span className="timeline-step-number">{moduleIndex + 1}</span>
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
              <li key={course.courseId} className="tree-node" style={{ "--module-accent": accentColor } as CSSProperties}>
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
                  <Link to={`/courses/${course.courseId}`} className="tree-node-card">
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
