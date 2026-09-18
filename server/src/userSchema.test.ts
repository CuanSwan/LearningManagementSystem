import { describe, expect, it } from "vitest";
import { UserSchema } from "./userSchema.js";

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
