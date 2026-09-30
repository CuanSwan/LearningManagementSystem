import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LearningPath } from "../types.js";
import { createLearningPath, listLearningPaths } from "../api.js";

// TipTap/ProseMirror are the single largest dependency in this app's bundle
// - lazy-loaded so students never pay for it, only admins the moment they
// actually open a form that uses it.
const RichTextEditor = lazy(() => import("../components/RichTextEditor.js").then((m) => ({ default: m.RichTextEditor })));

export function AdminLearningPathList() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createStatus, setCreateStatus] = useState<"idle" | "creating">("idle");
  const [createError, setCreateError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listLearningPaths()
      .then(setPaths)
      .catch((err) => setError(err.message));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateStatus("creating");
    setCreateError(null);
    try {
      const path = await createLearningPath({ title, description: description || undefined });
      navigate(`/admin/learning-paths/${path.pathId}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create learning path.");
      setCreateStatus("idle");
    }
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Learning Paths</h1>
          <p>Create and manage learning paths.</p>
        </div>
        <div>
          <Link to="/admin">Courses</Link> &middot; <Link to="/">View student site</Link>
        </div>
      </div>

      {error && <p>Failed to load learning paths: {error}</p>}

      <ul className="course-list">
        {paths.map((path) => (
          <li key={path.pathId} className="course-list-item">
            <Link to={`/admin/learning-paths/${path.pathId}`}>{path.title}</Link>
            <span> ({path.courseIds.length} courses)</span>
          </li>
        ))}
      </ul>

      <form className="course-form" onSubmit={handleCreate}>
        <h2>Create a learning path</h2>
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
        <button type="submit" disabled={createStatus === "creating"}>
          {createStatus === "creating" ? "Creating..." : "Create learning path"}
        </button>
        {createError && <span className="save-status save-status-error">{createError}</span>}
      </form>
    </main>
  );
}
