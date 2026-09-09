import { describe, expect, it } from "vitest";
import { parseCourse } from "./schemas.js";
import { Theme } from "./theme.js";

describe("CourseSchema", () => {
  it("defaults theme to an empty override (fully inherits the global default)", () => {
    const course = parseCourse({ courseId: "c1", title: "Sales Fundamentals" });
    expect(course.theme).toEqual({});
    expect(Theme.default().withOverrides(course.theme)).toEqual(Theme.default());
  });

  it("accepts a partial theme override", () => {
    const course = parseCourse({
      courseId: "c1",
      title: "Sales Fundamentals",
      theme: { primaryColor: "#ff6600" },
    });
    const resolved = Theme.default().withOverrides(course.theme);
    expect(resolved.primaryColor).toBe("#ff6600");
    expect(resolved.fontFamily).toBe(Theme.default().fontFamily);
  });

  it("rejects a theme override field with the wrong type", () => {
    expect(() => parseCourse({ courseId: "c1", title: "X", theme: { primaryColor: 123 } })).toThrow();
  });
});
