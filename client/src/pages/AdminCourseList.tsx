import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Theme, suggestTheme, type Course, type ThemeOverride } from "@lms/shared";
import { createCourse, listCourses } from "../api.js";
import { ThemeOverrideFields } from "../components/ThemeOverrideFields.js";

export function AdminCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<ThemeOverride>({});
  const navigate = useNavigate();

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const course = await createCourse({ title, description: description || undefined, theme });
    navigate(`/admin/courses/${course.courseId}`);
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Create and manage courses.</p>
        </div>
        <Link to="/">View student site</Link>
      </div>

      {error && <p>Failed to load courses: {error}</p>}

      <ul className="course-list">
        {courses.map((course) => {
          const resolved = Theme.default().withOverrides(course.theme);
          return (
            <li key={course.courseId} className="course-list-item">
              <span className="course-swatch" style={{ background: resolved.primaryColor }} aria-hidden="true" />
              <Link to={`/admin/courses/${course.courseId}`}>{course.title}</Link>
            </li>
          );
        })}
      </ul>

      <form className="course-form" onSubmit={handleCreate}>
        <h2>Create a course</h2>
        <label className="field">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field">
          Description
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <button
          type="button"
          className="suggest-theme-btn"
          disabled={!title}
          onClick={() => setTheme((prev) => ({ ...prev, ...suggestTheme({ title, description }) }))}
        >
          Suggest theme from title &amp; description
        </button>
        <ThemeOverrideFields value={theme} onChange={setTheme} />
        <button type="submit">Create course</button>
      </form>
    </main>
  );
}
