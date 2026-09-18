import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../types.js";
import { listCourses } from "../api.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { Theme, themeStyle } from "../theme.js";

export function StudentCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    listCourses().then(setCourses);
  }, []);

  return (
    <main className="student-view catalog-page">
      <Breadcrumb items={[{ label: "Learning Paths", to: "/learning-paths" }, { label: "Courses" }]} />
      <h1>Courses</h1>
      <div className="catalog-grid">
        {courses.map((course) => {
          const resolved = Theme.default().withOverrides(course.theme);
          return (
            <Link
              key={course.courseId}
              to={`/courses/${course.courseId}`}
              className="catalog-card"
              style={themeStyle(resolved)}
            >
              {course.category && <span className="catalog-card-category">{course.category}</span>}
              <h2>{course.title}</h2>
              {course.description && <p>{course.description}</p>}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
