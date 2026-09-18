import type { LearningPath, User } from "./types.js";

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
// access to every course, since they're the ones managing this content.
export function isCourseAccessible(user: User, courseId: string, learningPaths: LearningPath[]): boolean {
  if (user.role === "admin" || user.role === "super_admin") return true;
  return computeAccessibleCourseIds(user, learningPaths).has(courseId);
}
