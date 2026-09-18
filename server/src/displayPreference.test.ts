import { describe, expect, it } from "vitest";
import { ColorSchemeSchema, LessonDisplayModeSchema } from "./displayPreference.js";

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

describe("ColorSchemeSchema", () => {
  it("accepts light and dark", () => {
    expect(ColorSchemeSchema.safeParse("light").success).toBe(true);
    expect(ColorSchemeSchema.safeParse("dark").success).toBe(true);
  });

  it("rejects anything else", () => {
    expect(ColorSchemeSchema.safeParse("auto").success).toBe(false);
    expect(ColorSchemeSchema.safeParse(null).success).toBe(false);
  });
});
