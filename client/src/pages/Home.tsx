import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.js";
import { getProgress, listCourses, listLearningPaths, listModulesByCourse } from "../api.js";
import { isCourseAccessible } from "../access.js";
import { findContinueTarget, findFirstAssignedCourse, summarizeCourseProgress, type ContinueTarget } from "../continueLearning.js";
import type { Course, LearningPath, Module } from "../types.js";

export function Home() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0];
  // undefined = still loading, null = nothing assigned/in progress yet.
  const [primaryTarget, setPrimaryTarget] = useState<ContinueTarget | null | undefined>(undefined);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const [courses, progress, learningPaths] = await Promise.all([
        listCourses(),
        getProgress(),
        listLearningPaths(),
      ]);
      if (cancelled) return;

      // Only fetch content for courses the student can actually enter -
      // anything else 403s, and locked courses can't be "in progress" anyway.
      const accessibleCourses = courses.filter((c) => isCourseAccessible(user!, c.courseId, learningPaths));
      const modulesByCourse: Record<string, Module[]> = {};
      await Promise.all(
        accessibleCourses.map(async (course) => {
          modulesByCourse[course.courseId] = await listModulesByCourse(course.courseId);
        })
      );
      if (cancelled) return;

      const summaries = summarizeCourseProgress(accessibleCourses, modulesByCourse, progress.completedLessonIds);
      const target = findContinueTarget(progress.lastCompleted, accessibleCourses, modulesByCourse, summaries);
      if (target) {
        setPrimaryTarget(target);
        setIsContinuing(true);
        return;
      }
      const first = findFirstAssignedCourse(user!, courses, learningPaths);
      setPrimaryTarget(first ? { courseId: first.courseId, courseTitle: first.title } : null);
    }

    load().catch(() => {
      if (!cancelled) setPrimaryTarget(null);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <main className="student-view home-page">
      <div className="home-hero">
        <h1>Welcome to the LMS{firstName ? `, ${firstName}` : ""}</h1>
        <p className="home-hero-sub">What are you excited to get started with?</p>
      </div>

      <div className="home-choices">
        {primaryTarget ? (
          <Link
            to={
              primaryTarget.moduleId
                ? `/courses/${primaryTarget.courseId}/modules/${primaryTarget.moduleId}`
                : `/courses/${primaryTarget.courseId}`
            }
            className="home-choice-card home-choice-card-primary"
          >
            <span className="home-choice-card-eyebrow">
              {isContinuing ? "Continue where you left off" : "Get started"}
            </span>
            <h2>{primaryTarget.courseTitle}</h2>
            {primaryTarget.moduleTitle && <p>{primaryTarget.moduleTitle}</p>}
          </Link>
        ) : (
          <Link to="/courses" className="home-choice-card home-choice-card-primary">
            <h2>Get Started</h2>
            <p>
              {primaryTarget === undefined
                ? "New here? Browse the course catalog and start learning."
                : "No courses assigned to you yet - browse what's available, or check back once an admin assigns you one."}
            </p>
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
