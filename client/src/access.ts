import type { Course, LearningPath, User } from "./types.js";

// The set of courses a student can actually enter: directly assigned ones,
// plus every course in any learning path they're assigned. This is only
// meaningful for a student - an admin/super_admin's access isn't defined by
// assignments at all (see isCourseAccessible), so this never needs to see
// the full course list, just what's assigned.
export function computeAccessibleCourseIds(user: User, learningPaths: LearningPath[]): Set<string> {
  const assignedPaths = learningPaths.filter((p) => user.assignedLearningPathIds.includes(p.pathId));
  return new Set([...user.assignedCourseIds, ...assignedPaths.flatMap((p) => p.courseIds)]);
}

// Browsing the catalog (course title/description) is never gated - only
// entering a course's actual content is. An admin/super_admin always has
// access to every course, since they're the ones managing this content -
// reviewers get the same unrestricted access, but never track progress
// (see StudentCourse/StudentModule), so viewing doesn't record anything.
// A draft course is off-limits to everyone else, even someone it's directly
// assigned to - it isn't ready to be seen yet (see also the server's
// userHasCourseAccess, which enforces the same rule).
export function isCourseAccessible(
  user: User,
  course: Pick<Course, "courseId" | "status">,
  learningPaths: LearningPath[]
): boolean {
  if (user.role === "admin" || user.role === "super_admin" || user.role === "reviewer") return true;
  if (course.status !== "published") return false;
  return computeAccessibleCourseIds(user, learningPaths).has(course.courseId);
}
