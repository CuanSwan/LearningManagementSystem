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
  // Same "who's reviewing/authoring content" bypass as isCourseAccessible -
  // only they should even see that a draft course exists in the catalog.
  const isPrivileged = user?.role === "admin" || user?.role === "super_admin" || user?.role === "reviewer";

  useEffect(() => {
    listCourses().then(setCourses);
    listLearningPaths().then(setLearningPaths);
  }, []);

  return (
    <main className="student-view catalog-page">
      <Breadcrumb items={[{ label: "Learning Paths", to: "/learning-paths" }, { label: "Courses" }]} />
      <h1>Courses</h1>
      <div className="catalog-grid">
        {courses
          .filter((course) => course.status === "published" || isPrivileged)
          .map((course) => {
            const resolved = Theme.default().withOverrides(course.theme);
            const accessible = !user || isCourseAccessible(user, course, learningPaths);

            const cardContent = (
              <>
                <div className="catalog-card-header">
                  {course.category && <span className="catalog-card-category">{course.category}</span>}
                  {course.status === "draft" && <span className="tree-node-locked-badge">Draft</span>}
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
