import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Course, LearningPath } from "../types.js";
import { listCourses, listLearningPaths } from "../api.js";
import { isCourseAccessible } from "../access.js";
import { useAuth } from "../auth.js";
import { Breadcrumb } from "../components/Breadcrumb.js";
import { Theme, themeStyle } from "../theme.js";

export function StudentCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    listCourses().then(setCourses);
    listLearningPaths().then(setLearningPaths);
  }, []);

  return (
    <main className="student-view catalog-page">
      <Breadcrumb items={[{ label: "Learning Paths", to: "/learning-paths" }, { label: "Courses" }]} />
      <h1>Courses</h1>
      <div className="catalog-grid">
        {courses.map((course) => {
          const resolved = Theme.default().withOverrides(course.theme);
          const accessible = !user || isCourseAccessible(user, course.courseId, learningPaths);

          const cardContent = (
            <>
              <div className="catalog-card-header">
                {course.category && <span className="catalog-card-category">{course.category}</span>}
                {!accessible && <span className="tree-node-locked-badge">Not assigned</span>}
              </div>
              <h2>{course.title}</h2>
              {course.description && <p>{course.description}</p>}
            </>
          );

          return accessible ? (
            <Link
              key={course.courseId}
              to={`/courses/${course.courseId}`}
              className="catalog-card"
              style={themeStyle(resolved)}
            >
              {cardContent}
            </Link>
          ) : (
            <div key={course.courseId} className="catalog-card is-locked" aria-disabled="true">
              {cardContent}
            </div>
          );
        })}
      </div>
    </main>
  );
}
