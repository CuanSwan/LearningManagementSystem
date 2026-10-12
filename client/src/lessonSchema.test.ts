import { describe, expect, it } from "vitest";
import { LessonSchema } from "./lessonSchema.js";

const base = {
  lessonId: "l1",
  schemaVersion: 1,
  source: "human" as const,
  wordingStyle: "official" as const,
  order: 1,
  title: "Test",
};

// One minimal, valid content payload per lesson type the server accepts
// (see server/src/schemas.ts's RawComponentSchema/LessonSchema) - this is a
// regression guard against this schema drifting out of sync with the
// server's again, the way it did for dial/pipeline/presentationDial/
// cardGrid/hotspots/treeScrub/examBreakdown/promptSimulation (the import
// feature silently rejected every one of those types with an "Invalid
// discriminator value" error until this test existed).
const contentByType: Record<string, unknown> = {
  text: { body: "hello" },
  video: { videoUrl: "https://example.com/v.mp4" },
  quiz: { questions: [{ prompt: "Q?", options: ["a", "b"], correctIndex: 0 }] },
  practical: { instructions: "Do it", steps: ["step 1"], submissionType: "text" },
  diagram: { imageUrl: "https://example.com/d.png" },
  flashcard: { cards: [{ front: "F", back: "B" }] },
  accordion: { sections: [{ title: "S", body: "B" }] },
  matching: { pairs: [{ prompt: "A", match: "1" }, { prompt: "B", match: "2" }] },
  dial: { stages: [{ title: "S1", body: "B1" }, { title: "S2", body: "B2" }] },
  pipeline: { steps: [{ title: "S1", body: "B1" }, { title: "S2", body: "B2" }] },
  presentationDial: { stages: [{ title: "S1", body: "B1" }, { title: "S2", body: "B2" }] },
  cardGrid: {
    cards: [
      { title: "A", useWhen: "U", looksLike: "L", noteLabel: "N", noteBody: "NB" },
      { title: "B", useWhen: "U", looksLike: "L", noteLabel: "N", noteBody: "NB" },
    ],
  },
  hotspots: {
    tiles: [
      { title: "A", body: "B", example: "E" },
      { title: "B", body: "B", example: "E" },
    ],
  },
  treeScrub: {
    nodes: [
      { title: "Root", body: "B", parentIndex: 0 },
      { title: "Child", body: "B", parentIndex: 0 },
    ],
  },
  html: { html: "<p>hi</p>" },
  embed: { url: "https://example.com/embed" },
  examBreakdown: { passMarkPercent: 70, timeLimitMinutes: 30, questionCount: 10, openBook: false },
  promptSimulation: {
    botName: "Bot",
    lede: "Hi",
    presets: [{ label: "Preset", systemPrompt: "You are helpful." }],
    quickReplies: [],
  },
};

describe("LessonSchema", () => {
  for (const [type, content] of Object.entries(contentByType)) {
    it(`accepts a minimal valid "${type}" lesson`, () => {
      const result = LessonSchema.safeParse({ ...base, type, content });
      expect(result.success, result.success ? undefined : JSON.stringify(result.error.issues)).toBe(true);
    });
  }

  it("rejects an unknown type", () => {
    const result = LessonSchema.safeParse({ ...base, type: "madeUp", content: {} });
    expect(result.success).toBe(false);
  });

  it("allows an empty embed URL, matching the server's blank-lesson default", () => {
    const result = LessonSchema.safeParse({ ...base, type: "embed", content: { url: "" } });
    expect(result.success).toBe(true);
  });

  it("rejects a treeScrub node whose parentIndex isn't an earlier node", () => {
    const result = LessonSchema.safeParse({
      ...base,
      type: "treeScrub",
      content: {
        nodes: [
          { title: "Root", body: "B", parentIndex: 0 },
          { title: "Child", body: "B", parentIndex: 1 },
        ],
      },
    });
    expect(result.success).toBe(false);
  });
});
