import { describe, expect, it } from "vitest";
import { LessonDisplayModeSchema } from "./displayPreference.js";

describe("LessonDisplayModeSchema", () => {
  it("accepts the known display modes", () => {
    expect(LessonDisplayModeSchema.safeParse("vertical").success).toBe(true);
    expect(LessonDisplayModeSchema.safeParse("carousel").success).toBe(true);
    expect(LessonDisplayModeSchema.safeParse("accessible").success).toBe(true);
  });

  it("rejects anything else", () => {
    expect(LessonDisplayModeSchema.safeParse("grid").success).toBe(false);
    expect(LessonDisplayModeSchema.safeParse(null).success).toBe(false);
  });
});
