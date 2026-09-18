import { describe, expect, it } from "vitest";
import { findCourseToContinue, summarizeCourseProgress } from "./continueLearning.js";
import type { Course, Lesson, Module } from "./types.js";

function course(courseId: string, title: string): Course {
  return { courseId, title, theme: {} };
}

function lesson(lessonId: string): Lesson {
  return {
    lessonId,
    schemaVersion: 1,
    source: "human",
    wordingStyle: "official",
    order: 1,
    type: "video",
    content: { videoUrl: "" },
  };
}

function module(moduleId: string, courseId: string, status: Module["status"], lessonIds: string[]): Module {
  return {
    moduleId,
    courseId,
    status,
    seed: { title: moduleId, objective: "" },
    lessons: lessonIds.map(lesson),
  };
}

describe("summarizeCourseProgress", () => {
  it("counts only lessons from published modules toward the total", () => {
    const courses = [course("c1", "Course One")];
    const modulesByCourse = {
      c1: [module("m1", "c1", "published", ["l1", "l2"]), module("m2", "c1", "draft", ["l3"])],
    };
    const [summary] = summarizeCourseProgress(courses, modulesByCourse, ["l1"]);
    expect(summary.totalLessons).toBe(2);
    expect(summary.completedLessons).toBe(1);
  });

  it("returns zero totals for a course with no modules fetched yet", () => {
    const courses = [course("c1", "Course One")];
    const [summary] = summarizeCourseProgress(courses, {}, []);
    expect(summary).toEqual({ course: courses[0], totalLessons: 0, completedLessons: 0 });
  });
});

describe("findCourseToContinue", () => {
  it("picks the course with the most progress among those still in progress", () => {
    const summaries = [
      { course: course("c1", "Barely Started"), totalLessons: 10, completedLessons: 1 },
      { course: course("c2", "Almost Done"), totalLessons: 10, completedLessons: 8 },
    ];
    expect(findCourseToContinue(summaries)?.courseId).toBe("c2");
  });

  it("ignores a course with zero completed lessons - it isn't 'in progress'", () => {
    const summaries = [{ course: course("c1", "Untouched"), totalLessons: 10, completedLessons: 0 }];
    expect(findCourseToContinue(summaries)).toBeNull();
  });

  it("ignores a fully completed course - nothing left to continue", () => {
    const summaries = [{ course: course("c1", "Finished"), totalLessons: 5, completedLessons: 5 }];
    expect(findCourseToContinue(summaries)).toBeNull();
  });

  it("ignores a course with no published lessons at all", () => {
    const summaries = [{ course: course("c1", "Empty"), totalLessons: 0, completedLessons: 0 }];
    expect(findCourseToContinue(summaries)).toBeNull();
  });

  it("returns null when there are no courses", () => {
    expect(findCourseToContinue([])).toBeNull();
  });
});
