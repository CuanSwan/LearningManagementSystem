import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme, type Course, type Module } from "@lms/shared";
import { getCourse, listModulesByCourse } from "../api.js";
import { describeLesson, lessonTypeLabel } from "../lessonTemplates.js";
import { themeStyle } from "../theme.js";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

export function StudentCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

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
  }, [courseId]);

  if (!course) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);

  return (
    <main className="student-view" style={themeStyle(resolved)}>
      <p className="breadcrumb">
        <Link to="/">&larr; All courses</Link>
      </p>
      <h1>{course.title}</h1>
      {course.description && <p className="course-description">{course.description}</p>}

      {modules.length === 0 ? (
        <p>No published modules yet.</p>
      ) : (
        <ol className="tree-path">
          {modules.map((module, index) => (
            <li key={module.moduleId} className={`tree-node ${index % 2 === 0 ? "side-left" : "side-right"}`}>
              <span className="tree-node-dot" aria-hidden="true" />
              <div className="tree-node-card">
                <Link to={`/courses/${courseId}/modules/${module.moduleId}`} className="timeline-module-link">
                  <h2>{module.seed.title}</h2>
                  <p>{module.seed.objective}</p>
                </Link>

                {module.lessons.length > 0 && (
                  <ol className="timeline-steps">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.lessonId} className="timeline-step">
                        <span className="timeline-step-type">{lessonTypeLabel(lesson.type)}</span>
                        <span className="timeline-step-preview">{truncate(describeLesson(lesson), 70)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
