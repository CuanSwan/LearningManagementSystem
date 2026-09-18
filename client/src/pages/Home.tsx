import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.js";
import { getProgress, listCourses, listModulesByCourse } from "../api.js";
import { findCourseToContinue, summarizeCourseProgress } from "../continueLearning.js";
import type { Course, Module } from "../types.js";

export function Home() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0];
  const [continueCourse, setContinueCourse] = useState<Course | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [courses, progress] = await Promise.all([listCourses(), getProgress()]);
      const modulesByCourse: Record<string, Module[]> = {};
      await Promise.all(
        courses.map(async (course) => {
          modulesByCourse[course.courseId] = await listModulesByCourse(course.courseId);
        })
      );
      if (cancelled) return;
      const summaries = summarizeCourseProgress(courses, modulesByCourse, progress.completedLessonIds);
      setContinueCourse(findCourseToContinue(summaries));
    }

    load().catch(() => {
      // Nothing in-progress to resume is a fine fallback if this fails -
      // the "Get Started" card just stays put.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="student-view home-page">
      <div className="home-hero">
        <h1>Welcome to the LMS{firstName ? `, ${firstName}` : ""}</h1>
        <p className="home-hero-sub">What are you excited to get started with?</p>
      </div>

      <div className="home-choices">
        {continueCourse ? (
          <Link to={`/courses/${continueCourse.courseId}`} className="home-choice-card home-choice-card-primary">
            <span className="home-choice-card-eyebrow">Continue where you left off</span>
            <h2>{continueCourse.title}</h2>
          </Link>
        ) : (
          <Link to="/courses" className="home-choice-card home-choice-card-primary">
            <h2>Get Started</h2>
            <p>New here? Browse the course catalog and start learning.</p>
          </Link>
        )}
        <Link to="/courses" className="home-choice-card">
          <h2>Courses</h2>
          <p>Browse every course on its own and jump straight into one.</p>
        </Link>
        <Link to="/learning-paths" className="home-choice-card">
          <h2>Learning Paths</h2>
          <p>Follow a guided sequence of courses built around a goal or role.</p>
        </Link>
      </div>
    </main>
  );
}
