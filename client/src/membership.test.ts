import { describe, expect, it } from "vitest";
import { daysRemaining, daysRemainingLabel } from "./membership.js";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("daysRemaining", () => {
  it("rounds up a partial day rather than truncating", () => {
    const now = Date.now();
    expect(daysRemaining(now + 2.5 * DAY_MS, now)).toBe(3);
  });

  it("returns an exact whole-day count as-is", () => {
    const now = Date.now();
    expect(daysRemaining(now + 5 * DAY_MS, now)).toBe(5);
  });

  it("clamps to 0 once expiry has already passed", () => {
    const now = Date.now();
    expect(daysRemaining(now - DAY_MS, now)).toBe(0);
  });
});

describe("daysRemainingLabel", () => {
  it("uses singular phrasing for exactly 1 day left", () => {
    const now = Date.now();
    expect(daysRemainingLabel(now + DAY_MS, now)).toBe("1 day remaining");
  });

  it("uses plural phrasing for more than 1 day left", () => {
    const now = Date.now();
    expect(daysRemainingLabel(now + 5 * DAY_MS, now)).toBe("5 days remaining");
  });

  it("still rounds a few remaining hours up to 1 day, not 'today'", () => {
    const now = Date.now();
    expect(daysRemainingLabel(now + 30 * 60 * 1000, now)).toBe("1 day remaining");
  });

  it("reads as expiring today once already past expiry", () => {
    const now = Date.now();
    expect(daysRemainingLabel(now - DAY_MS, now)).toBe("Access expires today");
  });
});
