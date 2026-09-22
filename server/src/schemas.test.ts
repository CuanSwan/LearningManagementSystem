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
      lessonId: "l12",
      type: "dial",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 12,
      content: {
        stages: [
          { title: "Anchoring", body: "Setting the first offer to influence the negotiation range." },
          { title: "Reciprocity", body: "Concessions tend to be met with concessions." },
        ],
      },
    },
    {
      lessonId: "l13",
      type: "pipeline",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 13,
      content: {
        steps: [
          { title: "Source systems", body: "CRM, ERP, websites, IoT sensors, manual entry." },
          { title: "Data integration", body: "Moves data into a central location." },
        ],
      },
    },
    {
      lessonId: "l15",
      type: "presentationDial",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 15,
      content: {
        stages: [
          { title: "Raw Facts and Figures", body: "Data refers to raw, unprocessed facts and figures." },
          { title: "Data Is Raw", body: "A number by itself carries no meaning without context." },
        ],
      },
    },
    {
      lessonId: "l16",
      type: "hotspots",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 16,
      content: {
        tiles: [
          {
            title: "Volume",
            body: "The sheer amount of data being generated and stored.",
            example: "A supermarket chain records every till transaction across 1,400 stores, every day.",
          },
          {
            title: "Velocity",
            body: "The speed at which data arrives and has to be handled.",
            example: "Card payments are screened for fraud in the seconds before the transaction is approved.",
          },
        ],
      },
    },
    {
      lessonId: "l17",
      type: "treeScrub",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 17,
      content: {
        nodes: [
          { title: "Data Owner", body: "Accountable for a specific data domain.", parentIndex: 0 },
          { title: "Data Steward", body: "Defines business rules, resolves quality disputes.", parentIndex: 0 },
        ],
      },
    },
    {
      lessonId: "l14",
      type: "cardGrid",
      schemaVersion: 1,
      source: "human",
      wordingStyle: "official",
      order: 14,
      content: {
        cards: [
          {
            title: "Structured data",
            useWhen: "Consistency and reliability matter most.",
            looksLike: "Financial transactions, employee records, inventory counts.",
            noteLabel: "Why it wins",
            noteBody: "Enables precise queries, enforced rules, reliable reporting.",
          },
          {
            title: "Semi-structured data",
            useWhen: "The schema needs to evolve quickly.",
            looksLike: "Application logs, API integrations.",
            noteLabel: "Why it wins",
            noteBody: "Formats like JSON handle flexibility practically.",
          },
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
  it("accepts a module with all seventeen lesson types", () => {
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

  it("accepts a freshly-added embed lesson with no URL yet, like a draft", () => {
    const blank = {
      ...validModule,
      lessons: [
        {
          lessonId: "l10",
          type: "embed",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { url: "" },
        },
      ],
    };
    expect(ModuleSchema.safeParse(blank).success).toBe(true);
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

  it("rejects a dial lesson with fewer than 2 stages", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l12",
          type: "dial",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { stages: [{ title: "Only stage", body: "Not enough to step between." }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a dial lesson with more than 20 stages", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l12",
          type: "dial",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { stages: Array.from({ length: 21 }, (_, i) => ({ title: `Stage ${i}`, body: "Too many." })) },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a pipeline lesson with fewer than 2 steps", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l13",
          type: "pipeline",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { steps: [{ title: "Only step", body: "Not enough to track progress across." }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a pipeline lesson with more than 7 steps", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l13",
          type: "pipeline",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { steps: Array.from({ length: 8 }, (_, i) => ({ title: `Step ${i}`, body: "Too many." })) },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a presentation dial lesson with fewer than 2 stages", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l15",
          type: "presentationDial",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { stages: [{ title: "Only stage", body: "Not enough to step between." }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a presentation dial lesson with more than 20 stages", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l15",
          type: "presentationDial",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { stages: Array.from({ length: 21 }, (_, i) => ({ title: `Stage ${i}`, body: "Too many." })) },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a tree scrub lesson with fewer than 2 nodes", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l17",
          type: "treeScrub",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { nodes: [{ title: "Root only", body: "Not a tree by itself.", parentIndex: 0 }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a tree scrub lesson with more than 20 nodes", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l17",
          type: "treeScrub",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            nodes: Array.from({ length: 21 }, (_, i) => ({
              title: `Node ${i}`,
              body: "Too many.",
              parentIndex: 0,
            })),
          },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a tree scrub lesson where a node's parentIndex points at itself or a later node", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l17",
          type: "treeScrub",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            nodes: [
              { title: "Root", body: "The root.", parentIndex: 0 },
              { title: "Self-referencing", body: "Points at itself.", parentIndex: 1 },
            ],
          },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a tree scrub lesson where a node's parentIndex points forward at a node defined later", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l17",
          type: "treeScrub",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            nodes: [
              { title: "Root", body: "The root.", parentIndex: 0 },
              { title: "Points ahead", body: "References node 2, which comes later.", parentIndex: 2 },
              { title: "Later node", body: "Defined after the node pointing at it.", parentIndex: 0 },
            ],
          },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("accepts a tree scrub lesson with several nodes sharing the same parentIndex", () => {
    const valid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l17",
          type: "treeScrub",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            nodes: [
              { title: "Root", body: "The root.", parentIndex: 0 },
              { title: "Child A", body: "First sibling.", parentIndex: 0 },
              { title: "Child B", body: "Second sibling.", parentIndex: 0 },
              { title: "Child C", body: "Third sibling.", parentIndex: 0 },
            ],
          },
        },
      ],
    };
    expect(ModuleSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a hotspots lesson with fewer than 2 tiles", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l16",
          type: "hotspots",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: { tiles: [{ title: "Only tile", body: "Not enough to compare.", example: "N/A" }] },
        },
      ],
    };
    const result = ModuleSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("accepts a hotspots lesson with more than 8 tiles (wraps rather than crowds)", () => {
    const valid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l16",
          type: "hotspots",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            tiles: Array.from({ length: 12 }, (_, i) => ({ title: `Tile ${i}`, body: "Plenty.", example: "N/A" })),
          },
        },
      ],
    };
    expect(ModuleSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a card grid lesson with fewer than 2 cards", () => {
    const invalid = {
      ...validModule,
      lessons: [
        {
          lessonId: "l14",
          type: "cardGrid",
          schemaVersion: 1,
          source: "human",
          wordingStyle: "official",
          order: 1,
          content: {
            cards: [
              {
                title: "Only card",
                useWhen: "Not enough to compare against.",
                looksLike: "Just one option.",
                noteLabel: "Watch for",
                noteBody: "Nothing to weigh it against.",
              },
            ],
          },
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
