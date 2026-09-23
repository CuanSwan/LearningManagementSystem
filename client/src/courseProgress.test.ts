import { describe, expect, it } from "vitest";
import { isModuleComplete, isModuleLocked } from "./courseProgress.js";
import type { Lesson, Module } from "./types.js";

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

function moduleWith(moduleId: string, lessonIds: string[]): Module {
  return {
    moduleId,
    courseId: "c1",
    status: "published",
    seed: { title: moduleId, objective: "" },
    lessons: lessonIds.map(lesson),
  };
}

describe("isModuleComplete", () => {
  it("is false for a module with no lessons", () => {
    expect(isModuleComplete(moduleWith("m1", []), new Set())).toBe(false);
  });

  it("is true only once every lesson is completed", () => {
    const module = moduleWith("m1", ["l1", "l2"]);
    expect(isModuleComplete(module, new Set(["l1"]))).toBe(false);
    expect(isModuleComplete(module, new Set(["l1", "l2"]))).toBe(true);
  });
});

describe("isModuleLocked", () => {
  const modules = [moduleWith("m1", ["l1"]), moduleWith("m2", ["l2"]), moduleWith("m3", ["l3"])];

  it("never locks the first module for a student", () => {
    expect(isModuleLocked(modules, 0, new Set(), "student")).toBe(false);
  });

  it("locks a later module for a student until every prior module is complete", () => {
    expect(isModuleLocked(modules, 1, new Set(), "student")).toBe(true);
    expect(isModuleLocked(modules, 1, new Set(["l1"]), "student")).toBe(false);
  });

  it("doesn't re-lock a module that's already complete, even if a later requirement regresses", () => {
    expect(isModuleLocked(modules, 1, new Set(["l2"]), "student")).toBe(false);
  });

  it.each(["admin", "super_admin", "reviewer"] as const)(
    "never locks any module for a %s",
    (role) => {
      expect(isModuleLocked(modules, 2, new Set(), role)).toBe(false);
    }
  );
});
