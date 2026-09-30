import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Theme } from "../theme.js";
import { suggestTheme } from "../themeSuggestion.js";
import type { Course, ThemeOverride } from "../types.js";
import { createCourse, importRiseCourse, listCourses } from "../api.js";
import { ThemeOverrideFields } from "../components/ThemeOverrideFields.js";

// TipTap/ProseMirror are the single largest dependency in this app's bundle
// - lazy-loaded so students never pay for it, only admins the moment they
// actually open a form that uses it.
const RichTextEditor = lazy(() => import("../components/RichTextEditor.js").then((m) => ({ default: m.RichTextEditor })));

export function AdminCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState<ThemeOverride>({});
  const [createStatus, setCreateStatus] = useState<"idle" | "creating">("idle");
  const [createError, setCreateError] = useState<string | null>(null);
  const [riseFile, setRiseFile] = useState<File | null>(null);
  const [riseCategory, setRiseCategory] = useState("");
  const [riseStatus, setRiseStatus] = useState<"idle" | "importing" | "error">("idle");
  const [riseError, setRiseError] = useState<string | null>(null);
  const [riseResult, setRiseResult] = useState<{
    course: Course;
    moduleCount: number;
    skipped: { type: string; family?: string; variant?: string }[];
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus("creating");
    setCreateError(null);
    try {
      const course = await createCourse({ title, description: description || undefined, category: category || undefined, theme });
      navigate(`/admin/courses/${course.courseId}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create course.");
      setCreateStatus("idle");
    }
  }

  async function handleRiseImport(e: React.FormEvent) {
    e.preventDefault();
    if (!riseFile) return;
    setRiseStatus("importing");
    setRiseError(null);
    setRiseResult(null);
    try {
      const result = await importRiseCourse(riseFile, riseCategory || undefined);
      setRiseResult(result);
      setRiseStatus("idle");
      setCourses((prev) => [...prev, result.course]);
    } catch (err) {
      setRiseError((err as Error).message);
      setRiseStatus("error");
    }
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Create and manage courses.</p>
        </div>
        <div>
          <Link to="/admin/learning-paths">Learning paths</Link> &middot; <Link to="/">View student site</Link>
        </div>
      </div>

      {error && <p>Failed to load courses: {error}</p>}

      <ul className="course-list">
        {courses.map((course) => {
          const resolved = Theme.default().withOverrides(course.theme);
          return (
            <li key={course.courseId} className="course-list-item">
              <span className="course-swatch" style={{ background: resolved.primaryColor }} aria-hidden="true" />
              <Link to={`/admin/courses/${course.courseId}`}>{course.title}</Link>
              <span className="module-status"> ({course.status})</span>
              {course.importedFrom === "rise360" && <span className="import-source-badge">Rise 360 import</span>}
            </li>
          );
        })}
      </ul>

      <form className="course-form" onSubmit={handleCreate}>
        <h2>Create a course</h2>
        <p className="library-section-hint">
          Every course automatically starts with a mandatory Course Orientation module: an exam breakdown,
          orientation video, study plan, and additional resources, in that order. It's created blank for you to fill
          in once the course exists.
        </p>
        <label className="field">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <div className="field">
          Description
          <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
            <RichTextEditor value={description} onChange={setDescription} />
          </Suspense>
        </div>
        <label className="field">
          Category
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Core, IT, Business" />
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
        <button type="submit" disabled={createStatus === "creating"}>
          {createStatus === "creating" ? "Creating..." : "Create course"}
        </button>
        {createError && <span className="save-status save-status-error">{createError}</span>}
      </form>

      <form className="course-form" onSubmit={handleRiseImport}>
        <h2>Import from Rise 360</h2>
        <p className="library-section-hint">
          Upload a Rise 360 .zip export - it's decompiled into a new course with its modules and lessons. Like any other
          course, it also starts with a mandatory Course Orientation module (exam breakdown, orientation video, study
          plan, additional resources, in that order).
        </p>
        <label className="field">
          Rise 360 export (.zip)
          <input
            type="file"
            accept=".zip,application/zip"
            onChange={(e) => setRiseFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>
        <label className="field">
          Category
          <input value={riseCategory} onChange={(e) => setRiseCategory(e.target.value)} placeholder="e.g. Core, IT, Business" />
        </label>
        <button type="submit" disabled={!riseFile || riseStatus === "importing"}>
          {riseStatus === "importing" ? "Importing..." : "Import course"}
        </button>
        {riseStatus === "error" && riseError && <p className="import-error">{riseError}</p>}
        {riseResult && (
          <div className="save-status save-status-ok">
            <p>
              Imported &ldquo;{riseResult.course.title}&rdquo; with {riseResult.moduleCount} module
              {riseResult.moduleCount === 1 ? "" : "s"}.{" "}
              <Link to={`/admin/courses/${riseResult.course.courseId}`}>View course</Link>
            </p>
            {riseResult.skipped.length > 0 && (
              <p>
                {riseResult.skipped.length} block{riseResult.skipped.length === 1 ? "" : "s"} couldn&apos;t be converted and
                were skipped: {riseResult.skipped.map((s) => [s.type, s.family, s.variant].filter(Boolean).join("/")).join(", ")}
              </p>
            )}
          </div>
        )}
      </form>
    </main>
  );
}
