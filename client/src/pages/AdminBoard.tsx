import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCourses, patchCourse } from "../api.js";
import { BOARD_COLUMNS, groupCoursesByColumn, patchForColumn, type BoardColumnId } from "../boardColumns.js";
import { BOARD_COURSE_MIME } from "../dnd.js";
import { Theme } from "../theme.js";
import type { Course } from "../types.js";

// A GitHub-projects-style view of every course's production status, for
// managers who want the whole catalog's progress at a glance rather than
// clicking into each course - "what needs to be made" through "published"
// as columns, dragged between as work moves along. Publishing/unpublishing
// a course this way is equivalent to the status toggle on its own admin
// page - this is just another way to reach it, not a separate concept.
export function AdminBoard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<BoardColumnId | null>(null);

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

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

  const grouped = groupCoursesByColumn(courses);

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

      <div className="board">
        {BOARD_COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`board-column${overColumn === column.id ? " is-over" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setOverColumn(column.id)}
            onDragLeave={() => setOverColumn((current) => (current === column.id ? null : current))}
            onDrop={(e) => {
              e.preventDefault();
              setOverColumn(null);
              const courseId = e.dataTransfer.getData(BOARD_COURSE_MIME);
              if (courseId) moveCourse(courseId, column.id);
            }}
          >
            <div className="board-column-header">
              <h2>{column.title}</h2>
              <span className="board-column-count">{grouped[column.id].length}</span>
            </div>
            <p className="board-column-hint">{column.hint}</p>
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
                    <span className="board-card-swatch" style={{ background: resolved.primaryColor }} aria-hidden="true" />
                    <Link to={`/admin/courses/${course.courseId}`}>{course.title}</Link>
                    {course.category && <span className="board-card-category">{course.category}</span>}
                  </div>
                );
              })}
              {grouped[column.id].length === 0 && <p className="board-column-empty">No courses here</p>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
