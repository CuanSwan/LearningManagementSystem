import { describe, expect, it } from "vitest";
import { suggestTheme } from "./themeSuggestion.js";

describe("suggestTheme", () => {
  it("is deterministic for the same title", () => {
    const a = suggestTheme({ title: "Sales Fundamentals" });
    const b = suggestTheme({ title: "Sales Fundamentals" });
    expect(a).toEqual(b);
  });

  it("produces a valid hex color", () => {
    const { primaryColor } = suggestTheme({ title: "Anything At All" });
    expect(primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("gives different titles different accent colors", () => {
    const a = suggestTheme({ title: "Sales Fundamentals" });
    const b = suggestTheme({ title: "New Hire Onboarding" });
    expect(a.primaryColor).not.toBe(b.primaryColor);
  });

  it("suggests a serif font for compliance-flavored titles", () => {
    const result = suggestTheme({ title: "Workplace Safety Compliance" });
    expect(result.fontFamily).toContain("Merriweather");
  });

  it("suggests a monospace font for technical content", () => {
    const result = suggestTheme({ title: "Intro to Programming", description: "Learn the basics of coding." });
    expect(result.fontFamily).toContain("Fira Code");
  });

  it("suggests a geometric sans for creative content", () => {
    const result = suggestTheme({ title: "Creative Writing Workshop" });
    expect(result.fontFamily).toContain("Poppins");
  });

  it("omits fontFamily when nothing matches, leaving it to inherit", () => {
    const result = suggestTheme({ title: "Introduction to Negotiation" });
    expect("fontFamily" in result).toBe(false);
  });
});
