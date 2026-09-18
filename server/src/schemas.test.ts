import { describe, expect, it } from "vitest";
import { ModuleSchema, parseModule } from "./schemas.js";

const validModule = {
  moduleId: "intro-to-negotiation",
  courseId: "sales-fundamentals",
  status: "published",
  seed: {
    title: "Introduction to Negotiation",
    objective: "Learners understand the core principles of negotiation.",
    authorNotes: "Focus on real estate examples.",
  },
  lessons: [
    {
      lessonId: "l1",
      type: "text",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 1,
      content: { body: "Negotiation is..." },
    },
    {
      lessonId: "l2",
      type: "video",
      schemaVersion: 1,
      source: "ai_generated",
      wordingStyle: "shortened",
      order: 2,
      content: { videoUrl: "https://example.com/video.mp4", duration: 340 },
    },
    {
      lessonId: "l3",
      type: "quiz",
      schemaVersion: 1,
      source: "ai_generated",
      wordingStyle: "shortened",
      order: 3,
      content: {
        questions: [
          { prompt: "What is BATNA?", options: ["A", "B", "C"], correctIndex: 1 },
        ],
      },
    },
    {
      lessonId: "l4",
      type: "practical",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 4,
      content: {
        instructions: "Role-play a negotiation with a partner.",
        steps: ["Pick a scenario", "Negotiate", "Debrief"],
        submissionType: "text",
      },
    },
    {
      lessonId: "l5",
      type: "diagram",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 5,
      content: { imageUrl: "https://example.com/batna-diagram.png" },
    },
    {
      lessonId: "l6",
      type: "flashcard",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 6,
      content: { cards: [{ front: "What is BATNA?", back: "Best Alternative To a Negotiated Agreement" }] },
    },
    {
      lessonId: "l7",
      type: "accordion",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 7,
      content: { sections: [{ title: "Anchoring", body: "Setting the first offer to influence the negotiation range." }] },
    },
    {
      lessonId: "l8",
      type: "matching",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 8,
      content: {
        pairs: [
          { prompt: "BATNA", match: "Best Alternative To a Negotiated Agreement" },
          { prompt: "ZOPA", match: "Zone Of Possible Agreement" },
        ],
      },
    },
    {
      lessonId: "l9",
      type: "html",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 9,
      content: { html: "<p>A worked example, pasted in directly.</p>" },
    },
    {
      lessonId: "l10",
      type: "embed",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 10,
      content: { url: "https://example.com/practical-exercise" },
    },
    {
      lessonId: "l11",
      type: "examBreakdown",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 11,
      content: { passMarkPercent: 70, timeLimitMinutes: 90, questionCount: 40, openBook: false },
    },
  ],
};

describe("ModuleSchema", () => {
  it("accepts a module with all eleven lesson types", () => {
    expect(() => parseModule(validModule)).not.toThrow();
  });

  it("rejects an exam breakdown lesson with a pass mark over 100", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l11",
          type: "examBreakdown",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { passMarkPercent: 150, timeLimitMinutes: 90, questionCount: 40, openBook: false },
        },
      ],
    };
    expect(() => parseModule(invalid)).toThrow();
  });

  it("sanitizes an html lesson's content on parse, not just at render time", () => {
    const withScript = {
      ...validModule,
      lessons: [
        {
          lessonId: "l9",
          type: "html",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            html: '<h3>Worked example</h3><p onclick="steal()">Click me</p><script>evil()</script><img src=x onerror="evil2()">',
          },
        },
      ],
    };
    const parsed = parseModule(withScript);
    const lesson = parsed.lessons[0];
    if (lesson.type !== "html") throw new Error("expected an html lesson");
    expect(lesson.content.html).not.toContain("<script>");
    expect(lesson.content.html).not.toContain("onclick");
    expect(lesson.content.html).not.toContain("onerror");
    expect(lesson.content.html).toContain("<h3>Worked example</h3>");
  });

  it("sanitizes a text lesson's markup on parse, not just at render time", () => {
    const withScript = {
      ...validModule,
      lessons: [
        {
          lessonId: "l1",
          type: "text",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            body: '<h2>Heading</h2><p onclick="steal()">Click me</p><script>evil()</script>',
          },
        },
      ],
    };
    const parsed = parseModule(withScript);
    const lesson = parsed.lessons[0];
    if (lesson.type !== "text") throw new Error("expected a text lesson");
    expect(lesson.content.body).not.toContain("<script>");
    expect(lesson.content.body).not.toContain("onclick");
    expect(lesson.content.body).toContain("<h2>Heading</h2>");
  });

  it("rejects an embed lesson with a javascript: URL", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l10",
          type: "embed",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { url: "javascript:alert(1)" },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("accepts an embed lesson with a valid https URL", () => {
    const valid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l10",
          type: "embed",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { url: "https://example.com/exercise" },
        },
      ],
    };
    expect(ModuleSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a matching lesson with fewer than 2 pairs", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l8",
          type: "matching",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { pairs: [{ prompt: "BATNA", match: "Best Alternative To a Negotiated Agreement" }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a lesson with an unknown type", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "bad",
          type: "simulation",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {},
        },
      ],
    };
    expect(() => parseModule(invalid)).toThrow();
  });

  it("rejects a quiz lesson with fewer than 2 options", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l3",
          type: "quiz",
          schemaVersion: 1,
          source: "ai_generated",
          wordingStyle: "shortened",
          order: 1,
          content: { questions: [{ prompt: "?", options: ["only one"], correctIndex: 0 }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a lesson with an unknown wording style", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l1",
          type: "text",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "paraphrased",
          order: 1,
          content: { body: "Negotiation is..." },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
