import { describe, expect, it } from "vitest";
import { Theme } from "./theme.js";

describe("Theme", () => {
  it("withOverrides(undefined) or {} fully inherits the default", () => {
    const base = Theme.default();
    expect(base.withOverrides(undefined)).toEqual(base);
    expect(base.withOverrides({})).toEqual(base);
  });

  it("overrides only the fields stipulated, inheriting the rest", () => {
    const base = Theme.default();
    const resolved = base.withOverrides({ primaryColor: "#ff0000" });
    expect(resolved.primaryColor).toBe("#ff0000");
    expect(resolved.backgroundColor).toBe(base.backgroundColor);
    expect(resolved.fontFamily).toBe(base.fontFamily);
  });

  it("overrides every field when all are stipulated", () => {
    const resolved = Theme.default().withOverrides({
      primaryColor: "#111111",
      backgroundColor: "#222222",
      fontFamily: "'Poppins', sans-serif",
    });
    expect(resolved.primaryColor).toBe("#111111");
    expect(resolved.backgroundColor).toBe("#222222");
    expect(resolved.fontFamily).toBe("'Poppins', sans-serif");
  });

  it("toCssVariables exposes the resolved values as CSS custom properties", () => {
    const resolved = Theme.default().withOverrides({ primaryColor: "#abcdef" });
    expect(resolved.toCssVariables()["--theme-primary"]).toBe("#abcdef");
  });
});
