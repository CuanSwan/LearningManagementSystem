import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createCourse, listCourses, listUsers, patchCourse } from "../api.js";
import { useAuth } from "../auth.js";
import { BOARD_COLUMNS, columnRequiresAssignee, groupCoursesByColumn, patchForColumn, type BoardColumnId } from "../boardColumns.js";
import { BOARD_COURSE_MIME } from "../dnd.js";
import { Theme } from "../theme.js";
import type { Course, User } from "../types.js";

function isAssignable(user: User): boolean {
  return user.role === "admin" || user.role === "super_admin";
}

// A GitHub-projects-style view of every course's production status, for
// managers who want the whole catalog's progress at a glance rather than
// clicking into each course - "what needs to be made" through "published"
// as columns, dragged between as work moves along. Publishing/unpublishing
// a course this way is equivalent to the status toggle on its own admin
// page - this is just another way to reach it, not a separate concept.
export function AdminBoard() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<BoardColumnId | null>(null);

  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCategory, setNewJobCategory] = useState("");
  const [newJobAssignee, setNewJobAssignee] = useState("");
  const [newJobStatus, setNewJobStatus] = useState<"idle" | "creating" | "error">("idle");
  const [newJobError, setNewJobError] = useState<string | null>(null);

  // A drop into a column that requires an assignee (see boardColumns.ts),
  // on a course that doesn't have one yet - held here instead of completing
  // the move immediately, so the popup can either collect one (super_admin)
  // or explain why the move can't happen (anyone else) before anything
  // actually changes.
  const [pendingDrop, setPendingDrop] = useState<{ courseId: string; columnId: BoardColumnId } | null>(null);
  const [pendingAssignee, setPendingAssignee] = useState("");
  const [pendingError, setPendingError] = useState<string | null>(null);

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
    // Fetched for everyone, not just super_admins - a plain admin can still
    // see who a job is assigned to, even though only a super_admin can
    // change it.
    listUsers().then((all) => setUsers(all.filter(isAssignable)));
  }, []);

  function assigneeName(userId: string | undefined): string | null {
    if (!userId) return null;
    return users.find((u) => u.userId === userId)?.name ?? "Unknown";
  }

  async function moveCourse(courseId: string, columnId: BoardColumnId) {
    const patch = patchForColumn(columnId);
    const previous = courses;
    setCourses((prev) => prev.map((c) => (c.courseId === courseId ? { ...c, ...patch } : c)));
    try {
      await patchCourse(courseId, patch);
    } catch (err) {
      setError((err as Error).message);
      setCourses(previous);
    }
  }

  function handleDrop(columnId: BoardColumnId) {
    return (e: DragEvent) => {
      e.preventDefault();
      setOverColumn(null);
      const courseId = e.dataTransfer.getData(BOARD_COURSE_MIME);
      if (!courseId) return;
      const course = courses.find((c) => c.courseId === courseId);
      if (!course) return;
      if (columnRequiresAssignee(columnId) && !course.assignedTo) {
        setPendingDrop({ courseId, columnId });
        setPendingAssignee("");
        setPendingError(null);
        return;
      }
      moveCourse(courseId, columnId);
    };
  }

  async function confirmPendingDrop() {
    if (!pendingDrop || !pendingAssignee) return;
    setPendingError(null);
    const patch = { ...patchForColumn(pendingDrop.columnId), assignedTo: pendingAssignee };
    try {
      const updated = await patchCourse(pendingDrop.courseId, patch);
      setCourses((prev) => prev.map((c) => (c.courseId === updated.courseId ? updated : c)));
      setPendingDrop(null);
    } catch (err) {
      setPendingError((err as Error).message);
    }
  }

  async function reassignCourse(courseId: string, assignedTo: string) {
    const previous = courses;
    setCourses((prev) => prev.map((c) => (c.courseId === courseId ? { ...c, assignedTo: assignedTo || undefined } : c)));
    try {
      await patchCourse(courseId, { assignedTo: assignedTo || null });
    } catch (err) {
      setError((err as Error).message);
      setCourses(previous);
    }
  }

  async function handleCreateJob(e: FormEvent) {
    e.preventDefault();
    if (!newJobAssignee) return;
    setNewJobStatus("creating");
    setNewJobError(null);
    try {
      const created = await createCourse({
        title: newJobTitle,
        category: newJobCategory || undefined,
        assignedTo: newJobAssignee,
      });
      setCourses((prev) => [...prev, created]);
      setNewJobTitle("");
      setNewJobCategory("");
      setNewJobAssignee("");
      setNewJobStatus("idle");
    } catch (err) {
      setNewJobError((err as Error).message);
      setNewJobStatus("error");
    }
  }

  const grouped = groupCoursesByColumn(courses);
  const pendingCourse = pendingDrop ? courses.find((c) => c.courseId === pendingDrop.courseId) : undefined;
  const pendingColumn = pendingDrop ? BOARD_COLUMNS.find((c) => c.id === pendingDrop.columnId) : undefined;

  return (
    <main className="board-page">
      <div className="page-header">
        <div>
          <h1>Board</h1>
          <p>Drag a course between columns as it moves through production.</p>
        </div>
        <div>
          <Link to="/admin">Course list</Link>
        </div>
      </div>

      {error && <p className="import-error">{error}</p>}

      {isSuperAdmin && (
        <form className="course-form board-new-job-form" onSubmit={handleCreateJob}>
          <h2>New job</h2>
          <p className="library-section-hint">
            Create a course and hand it off to whoever's building it - it starts in Needs to be Made.
          </p>
          <label className="field">
            Title
            <input value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} required />
          </label>
          <label className="field">
            Category
            <input value={newJobCategory} onChange={(e) => setNewJobCategory(e.target.value)} placeholder="e.g. Core, IT, Business" />
          </label>
          <label className="field">
            Assign to
            <select value={newJobAssignee} onChange={(e) => setNewJobAssignee(e.target.value)} required>
              <option value="" disabled>
                Choose an admin or super admin
              </option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={newJobStatus === "creating" || !newJobTitle.trim() || !newJobAssignee}>
            {newJobStatus === "creating" ? "Creating..." : "Create job"}
          </button>
          {newJobStatus === "error" && newJobError && <span className="save-status save-status-error">{newJobError}</span>}
        </form>
      )}

      <div className="board">
        {BOARD_COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`board-column${overColumn === column.id ? " is-over" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setOverColumn(column.id)}
            onDragLeave={() => setOverColumn((current) => (current === column.id ? null : current))}
            onDrop={handleDrop(column.id)}
          >
            <div className="board-column-header">
              <h2>{column.title}</h2>
              <span className="board-column-count">{grouped[column.id].length}</span>
            </div>
            <p className="board-column-hint">
              {column.hint}
              {column.requiresAssignee ? " - requires an assignee" : ""}
            </p>
            <div className="board-column-cards">
              {grouped[column.id].map((course) => {
                const resolved = Theme.default().withOverrides(course.theme);
                return (
                  <div
                    key={course.courseId}
                    className="board-card"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(BOARD_COURSE_MIME, course.courseId);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                  >
                    <div className="board-card-row">
                      <span className="board-card-swatch" style={{ background: resolved.primaryColor }} aria-hidden="true" />
                      <Link to={`/admin/courses/${course.courseId}`}>{course.title}</Link>
                      {course.category && <span className="board-card-category">{course.category}</span>}
                    </div>
                    {isSuperAdmin ? (
                      <select
                        className="board-card-assignee-select"
                        value={course.assignedTo ?? ""}
                        onChange={(e) => reassignCourse(course.courseId, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.userId} value={u.userId}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      course.assignedTo && <span className="board-card-assignee">Assigned: {assigneeName(course.assignedTo)}</span>
                    )}
                  </div>
                );
              })}
              {grouped[column.id].length === 0 && <p className="board-column-empty">No courses here</p>}
            </div>
          </div>
        ))}
      </div>

      {pendingDrop && pendingCourse && pendingColumn && (
        <div className="modal-overlay" role="presentation" onClick={() => setPendingDrop(null)}>
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-on-drop-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="assign-on-drop-title">Assign before moving to {pendingColumn.title}</h2>
            {isSuperAdmin ? (
              <>
                <p>
                  <strong>{pendingCourse.title}</strong> needs someone responsible before it can move to{" "}
                  {pendingColumn.title}.
                </p>
                <label className="field">
                  Assign to
                  <select value={pendingAssignee} onChange={(e) => setPendingAssignee(e.target.value)} required>
                    <option value="" disabled>
                      Choose an admin or super admin
                    </option>
                    {users.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </label>
                {pendingError && <p className="import-error">{pendingError}</p>}
                <div className="modal-actions">
                  <button type="button" className="modal-secondary" onClick={() => setPendingDrop(null)}>
                    Cancel
                  </button>
                  <button type="button" className="modal-primary" disabled={!pendingAssignee} onClick={confirmPendingDrop}>
                    Assign &amp; move
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  {pendingColumn.title} requires an assignee, and <strong>{pendingCourse.title}</strong> doesn&apos;t have
                  one yet. Ask a super admin to assign it before moving it here.
                </p>
                <div className="modal-actions">
                  <button type="button" className="modal-primary" onClick={() => setPendingDrop(null)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
