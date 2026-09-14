import { describe, expect, it } from "vitest";
import { parseLearningPath } from "./schemas.js";

describe("LearningPathSchema", () => {
  it("defaults courseIds to an empty ordered list", () => {
    const path = parseLearningPath({ pathId: "p1", title: "Core Skills" });
    expect(path.courseIds).toEqual([]);
  });

  it("preserves course order", () => {
    const path = parseLearningPath({
      pathId: "p1",
      title: "Core Skills",
      courseIds: ["c2", "c1", "c3"],
    });
    expect(path.courseIds).toEqual(["c2", "c1", "c3"]);
  });

  it("rejects a missing title", () => {
    expect(() => parseLearningPath({ pathId: "p1" })).toThrow();
  });
});
