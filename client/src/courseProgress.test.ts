import { describe, expect, it } from "vitest";
import { isModuleComplete, isModuleLocked } from "./courseProgress.js";
import type { Module } from "./types.js";

function moduleWith(moduleId: string, lessonIds: string[]): Module {
  return {
    moduleId,
    status: "published",
    seed: { title: moduleId, objective: "x" },
    lessons: lessonIds.map((id, i) => ({
      lessonId: id,
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: i + 1,
      type: "text",
      content: { body: "" },
    })),
  };
}

describe("isModuleLocked", () => {
  const modules = [moduleWith("m1", ["l1"]), moduleWith("m2", ["l2"]), moduleWith("m3", ["l3"])];

  it("a student can't reach a module before completing every one before it", () => {
    expect(isModuleLocked(modules, 1, new Set(), "student")).toBe(true);
    expect(isModuleLocked(modules, 2, new Set(["l1"]), "student")).toBe(true);
  });

  it("a student unlocks a module once every module before it is complete", () => {
    expect(isModuleLocked(modules, 1, new Set(["l1"]), "student")).toBe(false);
    expect(isModuleLocked(modules, 2, new Set(["l1", "l2"]), "student")).toBe(false);
  });

  it("the first module is never locked for a student", () => {
    expect(isModuleLocked(modules, 0, new Set(), "student")).toBe(false);
  });

  it("an already-complete module stays unlocked even if a later requirement regresses", () => {
    expect(isModuleLocked(modules, 0, new Set(["l1"]), "student")).toBe(false);
  });

  it("an admin can reach every module regardless of completion state", () => {
    expect(isModuleLocked(modules, 2, new Set(), "admin")).toBe(false);
  });

  it("a super_admin can reach every module regardless of completion state", () => {
    expect(isModuleLocked(modules, 2, new Set(), "super_admin")).toBe(false);
  });
});

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
