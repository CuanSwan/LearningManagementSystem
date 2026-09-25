import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { suggestTheme } from "../themeSuggestion.js";
import type { Course, CourseStatus, Module, ReviewStatus, ThemeOverride } from "../types.js";
import { createModule, deleteCourse, getCourse, listModulesByCourse, patchCourse } from "../api.js";
import { ThemeOverrideFields } from "../components/ThemeOverrideFields.js";

const REVIEW_BADGE_LABEL: Record<ReviewStatus, string> = {
  changesRequested: "Changes requested",
  changed: "Ready to resubmit",
  needsReview: "Awaiting review",
};

// The one status worth surfacing at a glance for a module that has several
// active flags (its own, plus any of its lessons') - whatever needs the
// admin's attention soonest. changesRequested and changed both mean the
// ball is in the admin's court; needsReview means it's already been sent
// back and there's nothing to do but wait, so it only shows if nothing
// more urgent is also true.
function moduleReviewBadge(module: Module): ReviewStatus | null {
  const statuses = [module.reviewStatus, ...module.lessons.map((l) => l.reviewStatus)];
  if (statuses.includes("changesRequested")) return "changesRequested";
  if (statuses.includes("changed")) return "changed";
  if (statuses.includes("needsReview")) return "needsReview";
  return null;
}

export function AdminCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [theme, setTheme] = useState<ThemeOverride>({});
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<CourseStatus>("draft");
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
      setStatus(c.status);
    });
    listModulesByCourse(courseId).then(setModules);
  }, [courseId]);

  async function handleSaveTheme() {
    if (!courseId) return;
    setSaveStatus("saving");
    try {
      const updated = await patchCourse(courseId, { theme, category: category || undefined, status });
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
        <h2>Course settings</h2>
        <label className="status-select">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as CourseStatus)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <p className="field-hint">
          A draft course is invisible to students - even ones it's assigned to - until you publish it. Admins and
          reviewers can always see and open it either way.
        </p>
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
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </button>
          {saveStatus === "saved" && <span className="save-status save-status-ok">Saved</span>}
          {saveStatus === "error" && <span className="save-status save-status-error">Save failed</span>}
        </div>
      </section>

      <section>
        <h2>Modules</h2>
        <ul className="module-list">
          {modules.map((m) => {
            const badge = moduleReviewBadge(m);
            return (
              <li key={m.moduleId}>
                <Link to={`/admin/modules/${m.moduleId}`}>{m.seed.title}</Link>
                <span className="module-status"> ({m.status})</span>
                {badge && (
                  <span className={`review-panel-status review-panel-status-${badge}`}>{REVIEW_BADGE_LABEL[badge]}</span>
                )}
              </li>
            );
          })}
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
