import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Course, Lesson, Module } from "../types.js";
import { listAllModules, listCourses } from "../api.js";
import { LIBRARY_LESSON_MIME } from "../dnd.js";
import { describeLesson, lessonTypeLabel, moduleLessonLabel } from "../lessonTemplates.js";

const UNCATEGORIZED = "Uncategorized";

export function CourseLibraryTree() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listCourses(), listAllModules()])
      .then(([courseList, moduleList]) => {
        setCourses(courseList);
        setModules(moduleList);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="import-error">Failed to load course library: {error}</p>;
  if (courses.length === 0 && modules.length === 0) return null;

  const modulesByCourse = new Map<string, Module[]>();
  const unassignedModules: Module[] = [];
  for (const module of modules) {
    if (!module.courseId) {
      unassignedModules.push(module);
      continue;
    }
    const list = modulesByCourse.get(module.courseId) ?? [];
    list.push(module);
    modulesByCourse.set(module.courseId, list);
  }

  const coursesByCategory = new Map<string, Course[]>();
  for (const course of courses) {
    const category = course.category || UNCATEGORIZED;
    const list = coursesByCategory.get(category) ?? [];
    list.push(course);
    coursesByCategory.set(category, list);
  }

  const unassignedByCategory = new Map<string, Module[]>();
  for (const module of unassignedModules) {
    const category = module.category || UNCATEGORIZED;
    const list = unassignedByCategory.get(category) ?? [];
    list.push(module);
    unassignedByCategory.set(category, list);
  }

  return (
    <div className="library-section">
      <h3>Course library</h3>
      <p className="library-section-hint">Drag any existing lesson in to reuse a copy of it.</p>
      {[...coursesByCategory.entries()].map(([category, categoryCourses]) => (
        <details key={category} className="library-tree-node">
          <summary>{category}</summary>
          {categoryCourses.map((course) => (
            <details key={course.courseId} className="library-tree-node library-tree-course">
              <summary>{course.title}</summary>
              {(() => {
                const courseModules = modulesByCourse.get(course.courseId) ?? [];
                if (courseModules.length === 0) return <p className="library-tree-empty">No modules yet</p>;
                return courseModules.map((module) => (
                  <details key={module.moduleId} className="library-tree-node library-tree-module">
                    <summary>{module.seed.title}</summary>
                    {module.lessons.length === 0 ? (
                      <p className="library-tree-empty">No lessons yet</p>
                    ) : (
                      [...module.lessons]
                        .sort((a, b) => a.order - b.order)
                        .map((lesson) => <LibraryLessonItem key={lesson.lessonId} lesson={lesson} />)
                    )}
                  </details>
                ));
              })()}
            </details>
          ))}
        </details>
      ))}

      <div className="library-section library-unassigned">
        <h3>Unassigned</h3>
        <p className="library-section-hint">Reusable modules not attached to any course.</p>
        <Link to="/admin/modules/new" className="library-new-module-link">
          + New module
        </Link>
        {unassignedByCategory.size === 0 ? (
          <p className="library-tree-empty">Nothing unassigned yet</p>
        ) : (
          [...unassignedByCategory.entries()].map(([category, categoryModules]) => (
            <details key={category} className="library-tree-node">
              <summary>{category}</summary>
              {categoryModules.map((module) => (
                <details key={module.moduleId} className="library-tree-node library-tree-module">
                  <summary>{module.seed.title}</summary>
                  <Link to={`/admin/modules/${module.moduleId}`} className="library-tree-edit-link">
                    Edit module &rarr;
                  </Link>
                  {module.lessons.length === 0 ? (
                    <p className="library-tree-empty">No lessons yet</p>
                  ) : (
                    [...module.lessons]
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => (
                        <LibraryLessonItem key={lesson.lessonId} lesson={lesson} name={moduleLessonLabel(module, lesson)} />
                      ))
                  )}
                </details>
              ))}
            </details>
          ))
        )}
      </div>
    </div>
  );
}

function LibraryLessonItem({ lesson, name }: { lesson: Lesson; name?: string }) {
  return (
    <div
      className="library-item library-item-saved"
      draggable
      onDragStart={(e) => e.dataTransfer.setData(LIBRARY_LESSON_MIME, JSON.stringify(lesson))}
    >
      {name && <span className="library-item-name">{name}</span>}
      <span className="library-item-type">{lessonTypeLabel(lesson.type)}</span>
      <span className="library-item-preview">{describeLesson(lesson)}</span>
    </div>
  );
}
