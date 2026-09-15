import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { LearningPath } from "../types.js";
import { createLearningPath, listLearningPaths } from "../api.js";

export function AdminLearningPathList() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    listLearningPaths()
      .then(setPaths)
      .catch((err) => setError(err.message));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const path = await createLearningPath({ title, description: description || undefined });
    navigate(`/admin/learning-paths/${path.pathId}`);
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
        <label className="field">
          Description
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <button type="submit">Create learning path</button>
      </form>
    </main>
  );
}
