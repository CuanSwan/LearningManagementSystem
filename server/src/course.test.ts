import { describe, expect, it } from "vitest";
import { parseCourse } from "./schemas.js";

describe("CourseSchema", () => {
  it("defaults theme to an empty override (fully inherits the client's global default)", () => {
    const course = parseCourse({ courseId: "c1", title: "Sales Fundamentals" });
    expect(course.theme).toEqual({});
  });

  it("accepts a partial theme override", () => {
    const course = parseCourse({
      courseId: "c1",
      title: "Sales Fundamentals",
      theme: { primaryColor: "#ff6600" },
    });
    expect(course.theme).toEqual({ primaryColor: "#ff6600" });
  });

  it("rejects a theme override field with the wrong type", () => {
    expect(() => parseCourse({ courseId: "c1", title: "X", theme: { primaryColor: 123 } })).toThrow();
  });
});
