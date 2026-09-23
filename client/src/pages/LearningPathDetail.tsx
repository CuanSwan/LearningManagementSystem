import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme } from "../theme.js";
import type { Course, LearningPath, Module } from "../types.js";
import { getCourse, getLearningPath, getProgress, listLearningPaths, listModulesByCourse } from "../api.js";
import { isCourseAccessible } from "../access.js";
import { useAuth } from "../auth.js";
import { Breadcrumb } from "../components/Breadcrumb.js";

const IN_PROGRESS_COLOR = "#e8862f";
const LOCKED_COLOR = "#9ca3af";
const LANE_CLASSES = ["align-start", "align-end"];
const CORNER_RADIUS = 48;

function isModuleComplete(module: Module, completedIds: Set<string>): boolean {
  return module.lessons.length > 0 && module.lessons.every((l) => completedIds.has(l.lessonId));
}

function isCourseComplete(modules: Module[], completedIds: Set<string>): boolean {
  return modules.length > 0 && modules.every((m) => isModuleComplete(m, completedIds));
}

export function LearningPathDetail() {
  const { pathId } = useParams<{ pathId: string }>();
  const { user } = useAuth();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modulesByCourse, setModulesByCourse] = useState<Record<string, Module[]>>({});
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLElement | null>>([]);
  const [linePath, setLinePath] = useState("");

  useEffect(() => {
    if (!pathId) return;
    Promise.all([getLearningPath(pathId), listLearningPaths()]).then(async ([p, allPaths]) => {
      setPath(p);
      setLearningPaths(allPaths);
      const loadedCourses = await Promise.all(p.courseIds.map((id) => getCourse(id)));
      setCourses(loadedCourses);
      // A course the viewer isn't assigned (directly or via this or another
      // path) 403s on its modules - it'll render locked regardless, so
      // there's no content worth fetching for it.
      const moduleLists = await Promise.all(
        p.courseIds.map((id) =>
          !user || isCourseAccessible(user, id, allPaths)
            ? listModulesByCourse(id).then((list) => list.filter((m) => m.status === "published"))
            : Promise.resolve([])
        )
      );
      const map: Record<string, Module[]> = {};
      p.courseIds.forEach((id, i) => {
        map[id] = moduleLists[i];
      });
      setModulesByCourse(map);
    });
    getProgress().then((p) => setCompletedIds(new Set(p.completedLessonIds)));
  }, [pathId, user]);

  useLayoutEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container) return;
      const containerBox = container.getBoundingClientRect();
      const points = nodeRefs.current
        .filter((el): el is HTMLElement => !!el)
        .map((el) => {
          const box = el.getBoundingClientRect();
          return { x: box.left + box.width / 2 - containerBox.left, y: box.top + box.height / 2 - containerBox.top };
        });
      if (points.length < 2) {
        setLinePath("");
        return;
      }
      const TAIL = 70;
      const first = points[0];
      const last = points[points.length - 1];
      let d = `M ${first.x} ${first.y - TAIL} L ${first.x} ${first.y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const dx = curr.x - prev.x;
        const midY = (prev.y + curr.y) / 2;
        const sign = dx >= 0 ? 1 : -1;
        const r = Math.max(8, Math.min(CORNER_RADIUS, Math.abs(dx) / 2, (curr.y - prev.y) / 2 - 2));
        const entrySweep = sign > 0 ? 0 : 1;
        const exitSweep = sign > 0 ? 1 : 0;
        const turnInX = prev.x + sign * r;
        const turnOutX = curr.x - sign * r;
        // A rounded "elbow": drop, quarter-circle turn, run across, quarter-circle turn, drop.
        d += ` L ${prev.x} ${midY - r}`;
        d += ` A ${r} ${r} 0 0 ${entrySweep} ${turnInX} ${midY}`;
        d += ` L ${turnOutX} ${midY}`;
        d += ` A ${r} ${r} 0 0 ${exitSweep} ${curr.x} ${midY + r}`;
        d += ` L ${curr.x} ${curr.y}`;
      }
      d += ` L ${last.x} ${last.y + TAIL}`;
      setLinePath(d);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [courses]);

  if (!path) return <p>Loading...</p>;

  const allLessons = courses.flatMap((c) => (modulesByCourse[c.courseId] ?? []).flatMap((m) => m.lessons));
  const totalLessons = allLessons.length;
  const totalCompleted = allLessons.filter((l) => completedIds.has(l.lessonId)).length;

  return (
    <main className="student-view course-page">
      <Breadcrumb items={[{ label: "Learning Paths", to: "/learning-paths" }, { label: path.title }]} />
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
        <div className="path-snake-wrap" ref={containerRef}>
          <svg className="path-snake-svg" aria-hidden="true">
            <path d={linePath} />
          </svg>
          <ol className="path-snake">
            {courses.map((course, index) => {
              const courseModules = modulesByCourse[course.courseId] ?? [];
              const courseLessons = courseModules.flatMap((m) => m.lessons);
              const courseCompleted = courseLessons.filter((l) => completedIds.has(l.lessonId)).length;
              const courseTotal = courseLessons.length;
              const complete = isCourseComplete(courseModules, completedIds);
              const priorCoursesComplete = courses
                .slice(0, index)
                .every((c) => isCourseComplete(modulesByCourse[c.courseId] ?? [], completedIds));
              const accessible = !user || isCourseAccessible(user, course.courseId, learningPaths);
              // An admin/super_admin already bypasses isCourseAccessible
              // above; also skip the sequential-progression lock so they can
              // click straight through every course in the path while
              // reviewing content or checking layout.
              const isPrivileged = user?.role === "admin" || user?.role === "super_admin";
              const locked = !isPrivileged && (!accessible || (!complete && !priorCoursesComplete));
              const accentColor = complete ? Theme.default().primaryColor : locked ? LOCKED_COLOR : IN_PROGRESS_COLOR;
              const lane = LANE_CLASSES[index % LANE_CLASSES.length];

              const inner = (
                <>
                  <span
                    ref={(el) => {
                      nodeRefs.current[index] = el;
                    }}
                    className={`path-snake-bubble${complete ? " is-complete" : ""}${locked ? " is-locked" : ""}`}
                  >
                    {complete ? "✓" : locked ? "🔒" : index + 1}
                  </span>
                  <span className="path-snake-label">
                    <span className="path-snake-label-header">
                      <h2>{course.title}</h2>
                      {complete && <span className="tree-node-complete-badge">Complete</span>}
                      {locked && <span className="tree-node-locked-badge">Locked</span>}
                    </span>
                    {course.description && <p>{course.description}</p>}
                    {courseTotal > 0 && (
                      <span className="path-snake-progress">
                        {courseCompleted} of {courseTotal} lessons complete
                      </span>
                    )}
                  </span>
                </>
              );

              return (
                <li
                  key={course.courseId}
                  className={`path-snake-node ${lane}${locked ? " is-locked" : ""}`}
                  style={{ "--module-accent": accentColor } as CSSProperties}
                >
                  {locked ? (
                    <span className="path-snake-link" aria-disabled="true">
                      {inner}
                    </span>
                  ) : (
                    <Link to={`/courses/${course.courseId}`} className="path-snake-link">
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </main>
  );
}
