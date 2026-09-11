import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Theme, type Course } from "@lms/shared";
import { listCourses } from "../api.js";
import { themeStyle } from "../theme.js";

export function StudentCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    listCourses().then(setCourses);
  }, []);

  return (
    <main className="student-view catalog-page">
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
              <h2>{course.title}</h2>
              {course.description && <p>{course.description}</p>}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
