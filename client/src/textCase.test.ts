import { describe, expect, it } from "vitest";
import { toTitleCase } from "./textCase.js";

describe("toTitleCase", () => {
  it("capitalizes the first letter of every word", () => {
    expect(toTitleCase("the five project phases")).toBe("The Five Project Phases");
  });

  it("leaves already-capitalized words and acronyms alone", () => {
    expect(toTitleCase("what is BATNA")).toBe("What Is BATNA");
  });

  it("handles a single word", () => {
    expect(toTitleCase("quiz")).toBe("Quiz");
  });

  it("handles an empty string", () => {
    expect(toTitleCase("")).toBe("");
  });

  it("preserves punctuation between words", () => {
    expect(toTitleCase("fix the bot - prompt engineering")).toBe("Fix The Bot - Prompt Engineering");
  });
});
