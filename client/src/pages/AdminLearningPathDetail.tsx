import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Course, LearningPath } from "@lms/shared";
import { getLearningPath, listCourses, patchLearningPath } from "../api.js";

export function AdminLearningPathDetail() {
  const { pathId } = useParams<{ pathId: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (!pathId) return;
    getLearningPath(pathId).then((p) => {
      setPath(p);
      setTitle(p.title);
      setDescription(p.description ?? "");
    });
    listCourses().then(setAllCourses);
  }, [pathId]);

  if (!path) return <p>Loading...</p>;

  const courseById = new Map(allCourses.map((c) => [c.courseId, c]));
  const availableCourses = allCourses.filter((c) => !path.courseIds.includes(c.courseId));

  async function saveCourseIds(courseIds: string[]) {
    if (!pathId) return;
    const updated = await patchLearningPath(pathId, { courseIds });
    setPath(updated);
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!pathId) return;
    setSaveStatus("saving");
    try {
      const updated = await patchLearningPath(pathId, { title, description: description || undefined });
      setPath(updated);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourseId || !path) return;
    saveCourseIds([...path.courseIds, selectedCourseId]);
    setSelectedCourseId("");
  }

  function handleRemove(courseId: string) {
    if (!path) return;
    saveCourseIds(path.courseIds.filter((id) => id !== courseId));
  }

  function handleMove(index: number, direction: -1 | 1) {
    if (!path) return;
    const next = [...path.courseIds];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    saveCourseIds(next);
  }

  return (
    <main>
      <p className="breadcrumb">
        <Link to="/admin/learning-paths">&larr; All learning paths</Link>
      </p>
      <h1>{path.title}</h1>
      {path.description && <p>{path.description}</p>}

      <section>
        <h2>Path details</h2>
        <form className="course-form" onSubmit={handleSaveDetails}>
          <label className="field">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            Description
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="save-controls">
            <button type="submit" disabled={saveStatus === "saving"}>
              {saveStatus === "saving" ? "Saving..." : "Save details"}
            </button>
            {saveStatus === "saved" && <span className="save-status save-status-ok">Saved</span>}
            {saveStatus === "error" && <span className="save-status save-status-error">Save failed</span>}
          </div>
        </form>
      </section>

      <section>
        <h2>Courses (in order)</h2>
        <ol className="module-list">
          {path.courseIds.map((courseId, index) => {
            const course = courseById.get(courseId);
            return (
              <li key={courseId}>
                {course ? course.title : courseId}{" "}
                <button type="button" onClick={() => handleMove(index, -1)} disabled={index === 0}>
                  &uarr;
                </button>{" "}
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === path.courseIds.length - 1}
                >
                  &darr;
                </button>{" "}
                <button type="button" onClick={() => handleRemove(courseId)}>
                  Remove
                </button>
              </li>
            );
          })}
        </ol>

        <form className="course-form" onSubmit={handleAdd}>
          <h3>Add a course</h3>
          <label className="field">
            Course
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
              <option value="" disabled>
                Select a course
              </option>
              {availableCourses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={!selectedCourseId}>
            Add to path
          </button>
        </form>
      </section>
    </main>
  );
}
