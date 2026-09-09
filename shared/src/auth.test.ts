import { describe, expect, it } from "vitest";
import { hasAtLeastRole, UserSchema } from "./auth.js";

describe("hasAtLeastRole", () => {
  it("a role satisfies its own minimum", () => {
    expect(hasAtLeastRole("admin", "admin")).toBe(true);
  });

  it("a higher role satisfies a lower minimum", () => {
    expect(hasAtLeastRole("super_admin", "admin")).toBe(true);
    expect(hasAtLeastRole("admin", "student")).toBe(true);
  });

  it("a lower role does not satisfy a higher minimum", () => {
    expect(hasAtLeastRole("student", "admin")).toBe(false);
    expect(hasAtLeastRole("admin", "super_admin")).toBe(false);
  });
});

describe("UserSchema", () => {
  it("rejects an invalid email", () => {
    expect(() => UserSchema.parse({ userId: "1", email: "not-an-email", name: "X", role: "student" })).toThrow();
  });

  it("rejects an unknown role", () => {
    expect(() => UserSchema.parse({ userId: "1", email: "a@b.com", name: "X", role: "owner" })).toThrow();
  });
});
