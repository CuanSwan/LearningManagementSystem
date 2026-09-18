import type { Course, Module } from "./types.js";

export interface CourseProgress {
  course: Course;
  totalLessons: number;
  completedLessons: number;
}

// There's no "last visited" timestamp anywhere in the schema, so "where you
// left off" is approximated from what we do have: published lessons and
// which of them are marked complete. A course only counts as published
// content the student can actually see - draft modules (like a freshly
// created, still-empty orientation module) don't count toward the total.
export function summarizeCourseProgress(
  courses: Course[],
  modulesByCourse: Record<string, Module[]>,
  completedLessonIds: string[]
): CourseProgress[] {
  const completed = new Set(completedLessonIds);
  return courses.map((course) => {
    const lessons = (modulesByCourse[course.courseId] ?? [])
      .filter((m) => m.status === "published")
      .flatMap((m) => m.lessons);
    return {
      course,
      totalLessons: lessons.length,
      completedLessons: lessons.filter((l) => completed.has(l.lessonId)).length,
    };
  });
}

// Picks the course to resume - the one with the most progress that isn't
// finished yet. Untouched courses (0 completed) and finished ones (100%)
// aren't "in progress," so neither counts as somewhere to continue.
export function findCourseToContinue(summaries: CourseProgress[]): Course | null {
  const inProgress = summaries.filter(
    (s) => s.totalLessons > 0 && s.completedLessons > 0 && s.completedLessons < s.totalLessons
  );
  if (inProgress.length === 0) return null;
  return inProgress.reduce((best, s) => (s.completedLessons > best.completedLessons ? s : best)).course;
}
