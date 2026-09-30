import { describe, expect, it } from "vitest";
import { columnForCourse, groupCoursesByColumn, patchForColumn } from "./boardColumns.js";
import type { Course } from "./types.js";

function course(overrides: Partial<Course> = {}): Course {
  return {
    courseId: "c1",
    title: "Sales Fundamentals",
    theme: {},
    status: "draft",
    stage: "planned",
    ...overrides,
  };
}

describe("columnForCourse", () => {
  it("places a draft course in the column matching its stage", () => {
    expect(columnForCourse(course({ stage: "in_progress" }))).toBe("in_progress");
    expect(columnForCourse(course({ stage: "in_review" }))).toBe("in_review");
    expect(columnForCourse(course({ stage: "ready" }))).toBe("ready");
  });

  it("places a published course in Published regardless of its stage", () => {
    expect(columnForCourse(course({ status: "published", stage: "planned" }))).toBe("published");
  });
});

describe("groupCoursesByColumn", () => {
  it("buckets every course into exactly one column, including empty ones", () => {
    const courses = [
      course({ courseId: "a", stage: "planned" }),
      course({ courseId: "b", stage: "in_progress" }),
      course({ courseId: "c", status: "published" }),
    ];
    const grouped = groupCoursesByColumn(courses);
    expect(grouped.planned.map((c) => c.courseId)).toEqual(["a"]);
    expect(grouped.in_progress.map((c) => c.courseId)).toEqual(["b"]);
    expect(grouped.published.map((c) => c.courseId)).toEqual(["c"]);
    expect(grouped.in_review).toEqual([]);
    expect(grouped.ready).toEqual([]);
  });
});

describe("patchForColumn", () => {
  it("dropping into a draft column sets status back to draft and records the stage", () => {
    expect(patchForColumn("in_review")).toEqual({ status: "draft", stage: "in_review" });
  });

  it("dropping into Published publishes the course", () => {
    expect(patchForColumn("published")).toEqual({ status: "published", stage: "ready" });
  });
});
