import { describe, expect, it } from "vitest";
import { computeAccessibleCourseIds, isCourseAccessible } from "./access.js";
import type { LearningPath, User } from "./types.js";

function student(assignments: Partial<Pick<User, "assignedLearningPathIds" | "assignedCourseIds">> = {}): User {
  return {
    userId: "u1",
    email: "s@example.com",
    name: "Student",
    role: "student",
    assignedLearningPathIds: [],
    assignedCourseIds: [],
    ...assignments,
  };
}

function path(pathId: string, courseIds: string[]): LearningPath {
  return { pathId, title: pathId, courseIds };
}

function course(courseId: string, status: "draft" | "published" = "published"): { courseId: string; status: "draft" | "published" } {
  return { courseId, status };
}

describe("computeAccessibleCourseIds", () => {
  it("includes directly assigned courses", () => {
    const set = computeAccessibleCourseIds(student({ assignedCourseIds: ["c1", "c2"] }), []);
    expect(set).toEqual(new Set(["c1", "c2"]));
  });

  it("includes every course in an assigned learning path", () => {
    const paths = [path("p1", ["c1", "c2"])];
    const set = computeAccessibleCourseIds(student({ assignedLearningPathIds: ["p1"] }), paths);
    expect(set).toEqual(new Set(["c1", "c2"]));
  });

  it("combines directly assigned courses with courses from an assigned path", () => {
    const paths = [path("p1", ["c1"])];
    const set = computeAccessibleCourseIds(
      student({ assignedLearningPathIds: ["p1"], assignedCourseIds: ["c2"] }),
      paths
    );
    expect(set).toEqual(new Set(["c1", "c2"]));
  });

  it("ignores a learning path that exists but isn't assigned to this user", () => {
    const paths = [path("p1", ["c1"]), path("p2", ["c2"])];
    const set = computeAccessibleCourseIds(student({ assignedLearningPathIds: ["p1"] }), paths);
    expect(set).toEqual(new Set(["c1"]));
  });

  it("is empty for a user with no assignments", () => {
    expect(computeAccessibleCourseIds(student(), [])).toEqual(new Set());
  });
});

describe("isCourseAccessible", () => {
  it("grants an admin access to any course regardless of assignments", () => {
    const admin: User = { ...student(), role: "admin" };
    expect(isCourseAccessible(admin, course("unassigned-course"), [])).toBe(true);
  });

  it("grants a super_admin access to any course", () => {
    const superAdmin: User = { ...student(), role: "super_admin" };
    expect(isCourseAccessible(superAdmin, course("unassigned-course"), [])).toBe(true);
  });

  it("grants a reviewer access to any course regardless of assignments", () => {
    const reviewer: User = { ...student(), role: "reviewer" };
    expect(isCourseAccessible(reviewer, course("unassigned-course"), [])).toBe(true);
  });

  it("grants an admin access to a draft course", () => {
    const admin: User = { ...student(), role: "admin" };
    expect(isCourseAccessible(admin, course("c1", "draft"), [])).toBe(true);
  });

  it("grants a reviewer access to a draft course", () => {
    const reviewer: User = { ...student(), role: "reviewer" };
    expect(isCourseAccessible(reviewer, course("c1", "draft"), [])).toBe(true);
  });

  it("grants a student access to a directly assigned, published course", () => {
    expect(isCourseAccessible(student({ assignedCourseIds: ["c1"] }), course("c1"), [])).toBe(true);
  });

  it("denies a student access to a course that isn't assigned to them", () => {
    expect(isCourseAccessible(student({ assignedCourseIds: ["c1"] }), course("c2"), [])).toBe(false);
  });

  it("denies a student access to a directly assigned course that's still a draft", () => {
    expect(isCourseAccessible(student({ assignedCourseIds: ["c1"] }), course("c1", "draft"), [])).toBe(false);
  });
});
