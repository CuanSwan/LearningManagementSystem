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
      order: 1,
      content: { body: "Negotiation is..." },
    },
    {
      lessonId: "l2",
      type: "video",
      schemaVersion: 1,
      source: "ai_generated",
      order: 2,
      content: { videoUrl: "https://example.com/video.mp4", duration: 340 },
    },
    {
      lessonId: "l3",
      type: "quiz",
      schemaVersion: 1,
      source: "ai_generated",
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
      order: 4,
      content: {
        instructions: "Role-play a negotiation with a partner.",
        steps: ["Pick a scenario", "Negotiate", "Debrief"],
        submissionType: "text",
      },
    },
  ],
};

describe("ModuleSchema", () => {
  it("accepts a module with all four lesson types", () => {
    expect(() => parseModule(validModule)).not.toThrow();
  });

  it("rejects a lesson with an unknown type", () => {
    const invalid = {
      ...validModule,
      lessons: [
        { lessonId: "bad", type: "simulation", schemaVersion: 1, source: "human", order: 1, content: {} },
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
          order: 1,
          content: { questions: [{ prompt: "?", options: ["only one"], correctIndex: 0 }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
