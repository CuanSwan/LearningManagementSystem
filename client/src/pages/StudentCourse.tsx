import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme, type Course, type Module } from "@lms/shared";
import { getCourse, listModulesByCourse } from "../api.js";
import { themeStyle } from "../theme.js";

export function StudentCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId).then(setCourse);
    listModulesByCourse(courseId).then((list) => setModules(list.filter((m) => m.status === "published")));
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
        <ul className="student-module-list">
          {modules.map((module) => (
            <li key={module.moduleId}>
              <Link to={`/courses/${courseId}/modules/${module.moduleId}`}>{module.seed.title}</Link>
              <p>{module.seed.objective}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
