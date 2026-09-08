import { useEffect, useState } from "react";
import type { Module } from "@lms/shared";
import { LessonRenderer } from "./components/LessonRenderer.js";

export function App() {
  const [foundModule, setModule] = useState<Module | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/modules/intro-to-negotiation")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then(setModule)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Failed to load module: {error}</p>;
  if (!foundModule) return <p>Loading...</p>;

  const orderedLessons = [...foundModule.lessons].sort((a, b) => a.order - b.order);

  return (
    <main>
      <h1>{foundModule.seed.title}</h1>
      <p>{foundModule.seed.objective}</p>
      {orderedLessons.map((lesson) => (
        <LessonRenderer key={lesson.lessonId} lesson={lesson} />
      ))}
    </main>
  );
}
