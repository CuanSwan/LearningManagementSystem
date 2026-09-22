import { describe, expect, it } from "vitest";
import { PasswordSchema, UserSchema } from "./userSchema.js";

describe("UserSchema", () => {
  it("rejects an invalid email", () => {
    expect(() => UserSchema.parse({ userId: "1", email: "not-an-email", name: "X", role: "student" })).toThrow();
  });

  it("rejects an unknown role", () => {
    expect(() => UserSchema.parse({ userId: "1", email: "a@b.com", name: "X", role: "owner" })).toThrow();
  });

  it("defaults assignment fields to empty arrays for a stored user from before they existed", () => {
    const user = UserSchema.parse({ userId: "1", email: "a@b.com", name: "X", role: "student" });
    expect(user.assignedLearningPathIds).toEqual([]);
    expect(user.assignedCourseIds).toEqual([]);
  });
});

describe("PasswordSchema", () => {
  it("accepts a password with lowercase, uppercase, a number, and a symbol", () => {
    expect(PasswordSchema.safeParse("Abcdefg1!").success).toBe(true);
  });

  it("rejects a password under 8 characters even if otherwise complex", () => {
    expect(PasswordSchema.safeParse("Ab1!").success).toBe(false);
  });

  it("rejects a password missing a lowercase letter", () => {
    expect(PasswordSchema.safeParse("ABCDEFG1!").success).toBe(false);
  });

  it("rejects a password missing an uppercase letter", () => {
    expect(PasswordSchema.safeParse("abcdefg1!").success).toBe(false);
  });

  it("rejects a password missing a number", () => {
    expect(PasswordSchema.safeParse("Abcdefgh!").success).toBe(false);
  });

  it("rejects a password missing a symbol", () => {
    expect(PasswordSchema.safeParse("Abcdefg12").success).toBe(false);
  });

  it("reports every failing rule at once, not just the first", () => {
    const result = PasswordSchema.safeParse("short");
    expect(result.success).toBe(false);
    if (!result.success) {
      // too short, no uppercase, no number, no symbol - 4 distinct issues.
      expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
    }
  });
});
