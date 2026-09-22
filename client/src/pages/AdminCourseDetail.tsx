import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { suggestTheme } from "../themeSuggestion.js";
import type { Course, Module, ThemeOverride } from "../types.js";
import { createModule, deleteCourse, getCourse, listModulesByCourse, patchCourse } from "../api.js";
import { ThemeOverrideFields } from "../components/ThemeOverrideFields.js";

export function AdminCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [theme, setTheme] = useState<ThemeOverride>({});
  const [category, setCategory] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleObjective, setModuleObjective] = useState("");
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId).then((c) => {
      setCourse(c);
      setTheme(c.theme);
      setCategory(c.category ?? "");
    });
    listModulesByCourse(courseId).then(setModules);
  }, [courseId]);

  async function handleSaveTheme() {
    if (!courseId) return;
    setSaveStatus("saving");
    try {
      const updated = await patchCourse(courseId, { theme, category: category || undefined });
      setCourse(updated);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  async function handleCreateModule(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    setModuleError(null);
    try {
      const module = await createModule({ courseId, title: moduleTitle, objective: moduleObjective });
      navigate(`/admin/modules/${module.moduleId}`);
    } catch (err) {
      setModuleError((err as Error).message);
    }
  }

  async function handleDeleteCourse() {
    if (!courseId || !course) return;
    const confirmed = confirm(
      `Delete "${course.title}"? This is permanent and cannot be undone.\n\n` +
        "This course's modules are not deleted with it - they'll move to the unassigned library " +
        "(Component Library panel, in any module editor). To use them again, you'll need to add them to a new, separate course."
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteCourse(courseId);
      navigate("/admin");
    } catch {
      setDeleting(false);
    }
  }

  if (!course) return <p>Loading...</p>;

  return (
    <main>
      <p className="breadcrumb">
        <Link to="/admin">&larr; All courses</Link>
      </p>
      <h1>{course.title}</h1>
      {course.description && <p>{course.description}</p>}

      <section>
        <h2>Theme</h2>
        <label className="field">
          Category
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Core, IT, Business" />
        </label>
        <button
          type="button"
          className="suggest-theme-btn"
          onClick={() => setTheme((prev) => ({ ...prev, ...suggestTheme(course) }))}
        >
          Suggest theme from title &amp; description
        </button>
        <ThemeOverrideFields value={theme} onChange={setTheme} />
        <div className="save-controls">
          <button type="button" onClick={handleSaveTheme} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving..." : "Save theme"}
          </button>
          {saveStatus === "saved" && <span className="save-status save-status-ok">Saved</span>}
          {saveStatus === "error" && <span className="save-status save-status-error">Save failed</span>}
        </div>
      </section>

      <section>
        <h2>Modules</h2>
        <ul className="module-list">
          {modules.map((m) => (
            <li key={m.moduleId}>
              <Link to={`/admin/modules/${m.moduleId}`}>{m.seed.title}</Link>
              <span className="module-status"> ({m.status})</span>
            </li>
          ))}
        </ul>

        <form className="course-form" onSubmit={handleCreateModule}>
          <h3>Add a module</h3>
          <label className="field">
            Title
            <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} required />
          </label>
          <label className="field">
            Objective
            <input value={moduleObjective} onChange={(e) => setModuleObjective(e.target.value)} required />
          </label>
          <button type="submit">Add module</button>
          {moduleError && <span className="save-status save-status-error">{moduleError}</span>}
        </form>
      </section>

      <section className="danger-zone">
        <h2>Delete course</h2>
        <p>
          Permanent and cannot be undone. This course&apos;s modules move to the unassigned library instead of being
          deleted with it - you&apos;ll need to add them to a new, separate course to use them again.
        </p>
        <button type="button" className="danger-btn" onClick={handleDeleteCourse} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete course"}
        </button>
      </section>
    </main>
  );
}
