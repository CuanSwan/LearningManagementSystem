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
  ],
};

describe("ModuleSchema", () => {
  it("accepts a module with all eight lesson types", () => {
    expect(() => parseModule(validModule)).not.toThrow();
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
