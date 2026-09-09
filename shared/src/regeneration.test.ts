import { describe, expect, it } from "vitest";
import { canRegenerate } from "./regeneration.js";
import type { Lesson } from "./schemas.js";

function lesson(source: Lesson["source"], wordingStyle: Lesson["wordingStyle"]): Lesson {
  return {
    lessonId: "l1",
    type: "text",
    schemaVersion: 1,
    source,
    wordingStyle,
    order: 1,
    content: { body: "..." },
  };
}

describe("canRegenerate", () => {
  it("allows regenerating AI-generated, shortened lessons", () => {
    expect(canRegenerate(lesson("ai_generated", "shortened"))).toBe(true);
  });

  it("protects official wording even if AI-generated", () => {
    expect(canRegenerate(lesson("ai_generated", "official"))).toBe(false);
  });

  it("protects human-authored lessons regardless of wording style", () => {
    expect(canRegenerate(lesson("human", "shortened"))).toBe(false);
    expect(canRegenerate(lesson("human", "official"))).toBe(false);
  });
});
