import type { Course, LearningPath, Module, User } from "./types.js";

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

// What "Get Started" points a first-time student at: the first course in
// their first assigned learning path, or their first individually assigned
// course if they have no assigned path. Order matters here because it's
// exactly what the student was told to expect - a path is a sequence, so
// its first course comes before a standalone assignment.
export function findFirstAssignedCourse(user: User, courses: Course[], learningPaths: LearningPath[]): Course | null {
  const [firstPathId] = user.assignedLearningPathIds;
  const firstPath = firstPathId ? learningPaths.find((p) => p.pathId === firstPathId) : undefined;
  const [firstPathCourseId] = firstPath?.courseIds ?? [];
  const pathCourse = firstPathCourseId ? courses.find((c) => c.courseId === firstPathCourseId) : undefined;
  if (pathCourse) return pathCourse;

  const [firstCourseId] = user.assignedCourseIds;
  return (firstCourseId && courses.find((c) => c.courseId === firstCourseId)) || null;
}
