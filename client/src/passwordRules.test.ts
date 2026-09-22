import { describe, expect, it } from "vitest";
import { passwordMeetsRequirements } from "./passwordRules.js";

describe("passwordMeetsRequirements", () => {
  it("accepts a password with lowercase, uppercase, a number, and a symbol", () => {
    expect(passwordMeetsRequirements("Abcdefg1!")).toBe(true);
  });

  it("rejects one under 8 characters", () => {
    expect(passwordMeetsRequirements("Ab1!")).toBe(false);
  });

  it("rejects one missing a lowercase letter", () => {
    expect(passwordMeetsRequirements("ABCDEFG1!")).toBe(false);
  });

  it("rejects one missing an uppercase letter", () => {
    expect(passwordMeetsRequirements("abcdefg1!")).toBe(false);
  });

  it("rejects one missing a number", () => {
    expect(passwordMeetsRequirements("Abcdefgh!")).toBe(false);
  });

  it("rejects one missing a symbol", () => {
    expect(passwordMeetsRequirements("Abcdefg12")).toBe(false);
  });
});
