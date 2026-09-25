import { describe, expect, it } from "vitest";
import { buildEmbedLink } from "./embedLink.js";

describe("buildEmbedLink", () => {
  it("builds a URL pointing at the module, leaving {{email}} for Thinkific to fill in", () => {
    expect(buildEmbedLink("https://lms.example.com", "c1", "m1")).toBe(
      "https://lms.example.com/embed/courses/c1/modules/m1?email={{email}}"
    );
  });
});
