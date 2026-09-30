import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { copyToClipboard } from "../clipboard.js";
import { buildEmbedLink } from "../embedLink.js";
import { suggestTheme } from "../themeSuggestion.js";
import type { Course, CourseStatus, Module, ThemeOverride } from "../types.js";
import { createModule, deleteCourse, getCourse, importRiseModules, listModulesByCourse, patchCourse } from "../api.js";
import { ThemeOverrideFields } from "../components/ThemeOverrideFields.js";
import { RichTextView } from "../components/RichTextView.js";

// TipTap/ProseMirror are the single largest dependency in this app's bundle
// - lazy-loaded so students never pay for it, only admins the moment they
// actually open a form that uses it.
const RichTextEditor = lazy(() => import("../components/RichTextEditor.js").then((m) => ({ default: m.RichTextEditor })));

export function AdminCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [theme, setTheme] = useState<ThemeOverride>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<CourseStatus>("draft");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleObjective, setModuleObjective] = useState("");
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedModuleId, setCopiedModuleId] = useState<string | null>(null);
  const [riseModuleFile, setRiseModuleFile] = useState<File | null>(null);
  const [riseModuleStatus, setRiseModuleStatus] = useState<"idle" | "importing" | "error">("idle");
  const [riseModuleError, setRiseModuleError] = useState<string | null>(null);
  const [riseModuleResult, setRiseModuleResult] = useState<{
    moduleCount: number;
    skipped: { type: string; family?: string; variant?: string }[];
  } | null>(null);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId).then((c) => {
      setCourse(c);
      setTheme(c.theme);
      setTitle(c.title);
      setDescription(c.description ?? "");
      setCategory(c.category ?? "");
      setStatus(c.status);
    });
    listModulesByCourse(courseId).then(setModules);
  }, [courseId]);

  async function handleSaveTheme() {
    if (!courseId) return;
    setSaveStatus("saving");
    try {
      const updated = await patchCourse(courseId, { title, theme, description, category: category || undefined, status });
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

  async function handleRiseModuleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !riseModuleFile) return;
    setRiseModuleStatus("importing");
    setRiseModuleError(null);
    setRiseModuleResult(null);
    try {
      const result = await importRiseModules(courseId, riseModuleFile);
      setRiseModuleResult({ moduleCount: result.moduleCount, skipped: result.skipped });
      setRiseModuleStatus("idle");
      setModules((prev) => [...prev, ...result.modules]);
    } catch (err) {
      setRiseModuleError((err as Error).message);
      setRiseModuleStatus("error");
    }
  }

  async function handleCopyEmbedLink(moduleId: string) {
    const link = buildEmbedLink(window.location.origin, courseId!, moduleId);
    try {
      await copyToClipboard(link);
      setCopiedModuleId(moduleId);
      setTimeout(() => setCopiedModuleId((current) => (current === moduleId ? null : current)), 2000);
    } catch {
      // Both the Clipboard API and the execCommand fallback failed (e.g. a
      // non-secure context, or the browser blocking clipboard access
      // outright) - surface the link itself rather than doing nothing.
      window.prompt("Couldn't copy automatically - copy this link manually:", link);
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
      {course.importedFrom === "rise360" && <span className="import-source-badge">Rise 360 import</span>}
      {course.description && <RichTextView html={course.description} />}

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
          A draft course is invisible to students - even ones it's assigned to - until you publish it. Admins can
          always see and open it either way.
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
          {modules.map((m) => (
            <li key={m.moduleId}>
              <Link to={`/admin/modules/${m.moduleId}`}>{m.seed.title}</Link>
              <span className="module-status"> ({m.status})</span>
              <button
                type="button"
                className="copy-embed-link-btn"
                onClick={() => handleCopyEmbedLink(m.moduleId)}
                disabled={m.status !== "published"}
                title={
                  m.status !== "published"
                    ? "Publish this module first - an embed link only works once it's published"
                    : "Copy a Thinkific embed link for this module"
                }
              >
                {copiedModuleId === m.moduleId ? "Copied!" : "Copy Thinkific embed link"}
              </button>
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

        <form className="course-form" onSubmit={handleRiseModuleImport}>
          <h3>Import a module from Rise 360</h3>
          <p className="library-section-hint">
            Upload a Rise 360 .zip export - it's decompiled into one or more modules (one per top-level lesson in the
            export) and added to this course, without creating a new course.
          </p>
          <label className="field">
            Rise 360 export (.zip)
            <input
              type="file"
              accept=".zip,application/zip"
              onChange={(e) => setRiseModuleFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>
          <button type="submit" disabled={!riseModuleFile || riseModuleStatus === "importing"}>
            {riseModuleStatus === "importing" ? "Importing..." : "Import module(s)"}
          </button>
          {riseModuleStatus === "error" && riseModuleError && <p className="import-error">{riseModuleError}</p>}
          {riseModuleResult && (
            <div className="save-status save-status-ok">
              <p>
                Imported {riseModuleResult.moduleCount} module{riseModuleResult.moduleCount === 1 ? "" : "s"}.
              </p>
              {riseModuleResult.skipped.length > 0 && (
                <p>
                  {riseModuleResult.skipped.length} block{riseModuleResult.skipped.length === 1 ? "" : "s"} couldn&apos;t be
                  converted and were skipped:{" "}
                  {riseModuleResult.skipped.map((s) => [s.type, s.family, s.variant].filter(Boolean).join("/")).join(", ")}
                </p>
              )}
            </div>
          )}
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
