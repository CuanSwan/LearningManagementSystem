import type { Course, LearningPath, Module, User } from "./types.js";

export interface CourseProgress {
  course: Course;
  totalLessons: number;
  completedLessons: number;
}

export interface LastVisited {
  courseId: string;
  moduleId: string;
}

// What "Continue where you left off" actually links to - a specific module
// when one is known, otherwise just the course.
export interface ContinueTarget {
  courseId: string;
  courseTitle: string;
  moduleId?: string;
  moduleTitle?: string;
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

// The real signal, when it exists: the module the student most recently
// opened. Preferred over the completion-based heuristic below, since it's
// literally where they left off rather than a guess - but only if that
// module is still there to resume (still published, and its course still
// among the ones the caller fetched, i.e. still accessible). Falls back to
// the heuristic for progress recorded before this tracking existed, or if
// the last-visited module was since deleted or access to it was revoked.
export function findContinueTarget(
  lastVisited: LastVisited | null,
  courses: Course[],
  modulesByCourse: Record<string, Module[]>,
  summaries: CourseProgress[]
): ContinueTarget | null {
  if (lastVisited) {
    const course = courses.find((c) => c.courseId === lastVisited.courseId);
    const module = modulesByCourse[lastVisited.courseId]?.find(
      (m) => m.moduleId === lastVisited.moduleId && m.status === "published"
    );
    if (course && module) {
      return { courseId: course.courseId, courseTitle: course.title, moduleId: module.moduleId, moduleTitle: module.seed.title };
    }
  }

  const course = findCourseToContinue(summaries);
  return course ? { courseId: course.courseId, courseTitle: course.title } : null;
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
