import { describe, expect, it } from "vitest";
import { UserSchema } from "./userSchema.js";

describe("UserSchema", () => {
  it("rejects an invalid email", () => {
    expect(() => UserSchema.parse({ userId: "1", email: "not-an-email", name: "X", role: "student" })).toThrow();
  });

  it("rejects an unknown role", () => {
    expect(() => UserSchema.parse({ userId: "1", email: "a@b.com", name: "X", role: "owner" })).toThrow();
  });
});
