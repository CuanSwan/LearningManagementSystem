import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Theme, type Course, type Module } from "@lms/shared";
import { getCourse, getModule } from "../api.js";
import { LessonRenderer } from "../components/LessonRenderer.js";
import { themeStyle } from "../theme.js";

export function StudentModule() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [foundModule, setModule] = useState<Module | null>(null);

  useEffect(() => {
    if (!courseId || !moduleId) return;
    getCourse(courseId).then(setCourse);
    getModule(moduleId).then(setModule);
  }, [courseId, moduleId]);

  if (!course || !foundModule) return <p>Loading...</p>;
  const resolved = Theme.default().withOverrides(course.theme);
  const orderedLessons = [...foundModule.lessons].sort((a, b) => a.order - b.order);

  return (
    <main className="student-view" style={themeStyle(resolved)}>
      <p className="breadcrumb">
        <Link to={`/courses/${courseId}`}>&larr; {course.title}</Link>
      </p>
      <h1>{foundModule.seed.title}</h1>
      <p className="course-description">{foundModule.seed.objective}</p>

      <div className="student-lessons">
        {orderedLessons.map((lesson) => (
          <LessonRenderer key={lesson.lessonId} lesson={lesson} />
        ))}
      </div>
    </main>
  );
}
