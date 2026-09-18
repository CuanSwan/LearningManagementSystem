import { useEffect, useState } from "react";
import type { Course, LearningPath, User } from "../types.js";
import { listCourses, listLearningPaths, listUsers, setUserAssignments } from "../api.js";

function StudentAssignmentRow({
  student,
  courses,
  learningPaths,
  onSaved,
}: {
  student: User;
  courses: Course[];
  learningPaths: LearningPath[];
  onSaved: (updated: User) => void;
}) {
  const [pathIds, setPathIds] = useState<string[]>(student.assignedLearningPathIds);
  const [courseIds, setCourseIds] = useState<string[]>(student.assignedCourseIds);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const dirty =
    pathIds.length !== student.assignedLearningPathIds.length ||
    courseIds.length !== student.assignedCourseIds.length ||
    !pathIds.every((id) => student.assignedLearningPathIds.includes(id)) ||
    !courseIds.every((id) => student.assignedCourseIds.includes(id));

  function toggle(ids: string[], setIds: (ids: string[]) => void, id: string) {
    setIds(ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id]);
    setSaveStatus("idle");
  }

  async function handleSave() {
    setSaveStatus("saving");
    try {
      const updated = await setUserAssignments(student.userId, {
        assignedLearningPathIds: pathIds,
        assignedCourseIds: courseIds,
      });
      onSaved(updated);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  return (
    <details className="assignment-row">
      <summary>
        <strong>{student.name}</strong>
        <span className="module-status"> {student.email}</span>
        <span className="module-status">
          {" "}
          - {student.assignedLearningPathIds.length} path{student.assignedLearningPathIds.length === 1 ? "" : "s"},{" "}
          {student.assignedCourseIds.length} course{student.assignedCourseIds.length === 1 ? "" : "s"} assigned
        </span>
      </summary>

      <div className="assignment-row-body">
        <div className="assignment-group">
          <h3>Learning paths</h3>
          {learningPaths.length === 0 ? (
            <p className="library-tree-empty">No learning paths yet.</p>
          ) : (
            learningPaths.map((path) => (
              <label key={path.pathId} className="assignment-checkbox">
                <input
                  type="checkbox"
                  checked={pathIds.includes(path.pathId)}
                  onChange={() => toggle(pathIds, setPathIds, path.pathId)}
                />
                {path.title}
              </label>
            ))
          )}
        </div>

        <div className="assignment-group">
          <h3>Individual courses</h3>
          {courses.length === 0 ? (
            <p className="library-tree-empty">No courses yet.</p>
          ) : (
            courses.map((course) => (
              <label key={course.courseId} className="assignment-checkbox">
                <input
                  type="checkbox"
                  checked={courseIds.includes(course.courseId)}
                  onChange={() => toggle(courseIds, setCourseIds, course.courseId)}
                />
                {course.title}
              </label>
            ))
          )}
        </div>

        <div className="assignment-row-actions">
          <button type="button" onClick={handleSave} disabled={!dirty || saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </button>
          {saveStatus === "saved" && <span className="save-status save-status-ok">Saved</span>}
          {saveStatus === "error" && <span className="save-status save-status-error">Save failed</span>}
        </div>
      </div>
    </details>
  );
}

export function AdminAssignments() {
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listUsers(), listCourses(), listLearningPaths()])
      .then(([users, courses, learningPaths]) => {
        setStudents(users.filter((u) => u.role === "student"));
        setCourses(courses);
        setLearningPaths(learningPaths);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main>
      <h1>Assignments</h1>
      <p>
        Assign learning paths and individual courses to students. A student can see every course in the catalog, but
        can only open the ones assigned to them directly or through an assigned learning path.
      </p>

      {error && <p className="import-error">Failed to load: {error}</p>}

      {students.length === 0 ? (
        <p>No students yet.</p>
      ) : (
        <div className="assignment-list">
          {students.map((student) => (
            <StudentAssignmentRow
              key={student.userId}
              student={student}
              courses={courses}
              learningPaths={learningPaths}
              onSaved={(updated) => setStudents((prev) => prev.map((s) => (s.userId === updated.userId ? updated : s)))}
            />
          ))}
        </div>
      )}
    </main>
  );
}
