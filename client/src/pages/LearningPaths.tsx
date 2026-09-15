import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LearningPath } from "../types.js";
import { listLearningPaths } from "../api.js";

export function LearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    listLearningPaths().then(setPaths);
  }, []);

  return (
    <main className="student-view catalog-page">
      <h1>Learning Paths</h1>
      <div className="catalog-grid">
        {paths.map((path) => (
          <Link key={path.pathId} to={`/learning-paths/${path.pathId}`} className="catalog-card">
            <span className="catalog-card-category">
              {path.courseIds.length} {path.courseIds.length === 1 ? "Course" : "Courses"}
            </span>
            <h2>{path.title}</h2>
            {path.description && <p>{path.description}</p>}
          </Link>
        ))}
      </div>
    </main>
  );
}
