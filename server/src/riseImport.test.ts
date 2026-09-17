import { describe, expect, it } from "vitest";
import { convertRiseCourse, RiseImportError } from "./riseImport.js";

function riseCourse(lessons: unknown[]) {
  return { course: { title: "Test Course", description: "<p>A course.</p>", lessons } };
}

describe("convertRiseCourse", () => {
  it("throws on data with no course field", () => {
    expect(() => convertRiseCourse({})).toThrow(RiseImportError);
  });

  it("throws on a course with no lessons", () => {
    expect(() => convertRiseCourse(riseCourse([]))).toThrow(RiseImportError);
  });

  it("always tags converted lessons as ai_generated/shortened, regardless of block metadata", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            { id: "b1", type: "text", family: "text", items: [{ paragraph: "<p>One</p>" }], metadata: { createdVia: "human" } },
            { id: "b2", type: "divider", family: "continue", variant: "continue" },
            { id: "b3", type: "text", family: "text", items: [{ paragraph: "<p>Two</p>" }] },
          ],
        },
      ])
    );
    for (const lesson of result.modules[0].lessons) {
      expect(lesson.source).toBe("ai_generated");
      expect(lesson.wordingStyle).toBe("shortened");
    }
  });

  it("converts text blocks (heading+paragraph, plain paragraph, and impact)", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "Module One",
          description: "<p>Objective one.</p>",
          items: [
            {
              id: "b1",
              type: "text",
              family: "text",
              items: [{ heading: "Hi", paragraph: "<p>Body text.</p>" }],
            },
            { id: "b2", type: "text", family: "impact", variant: "b", items: [{ paragraph: "<p>Impact line.</p>" }] },
          ],
        },
      ])
    );
    expect(result.modules).toHaveLength(1);
    expect(result.modules[0].title).toBe("Module One");
    expect(result.modules[0].objective).toBe("Objective one.");
    // Directly adjacent text blocks (no divider/interactive block between
    // them) merge into a single fuller lesson - see the dedicated merging
    // tests below for cases with something between them.
    expect(result.modules[0].lessons).toEqual([
      expect.objectContaining({
        type: "text",
        content: { body: "<h2>Hi</h2><p>Body text.</p>\n\n<p>Impact line.</p>" },
      }),
    ]);
  });

  it("converts a numbered list into a text lesson", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "list",
              family: "list",
              items: [
                { number: "1", paragraph: "<p>First</p>" },
                { number: "2", paragraph: "<p>Second</p>" },
              ],
            },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons[0]).toMatchObject({
      type: "text",
      content: { body: "<ol><li>First</li><li>Second</li></ol>" },
    });
  });

  it("demotes every heading after the first, within one merged lesson, to a subheading", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            { id: "b1", type: "text", family: "text", items: [{ heading: "First", paragraph: "<p>A</p>" }] },
            { id: "b2", type: "text", family: "text", items: [{ heading: "Second", paragraph: "<p>B</p>" }] },
            { id: "b3", type: "text", family: "text", items: [{ heading: "Third", paragraph: "<p>C</p>" }] },
          ],
        },
      ])
    );
    const body = (result.modules[0].lessons[0].content as { body: string }).body;
    expect(body).toContain("<h2>First</h2>");
    expect(body).toContain("<h3>Second</h3>");
    expect(body).toContain("<h3>Third</h3>");
    expect(body).not.toContain("<h2>Second</h2>");
  });

  it("gives each merged lesson its own fresh first-heading, not a running count across lessons", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            { id: "b1", type: "text", family: "text", items: [{ heading: "Lesson 1 heading", paragraph: "<p>A</p>" }] },
            { id: "b2", type: "knowledgeCheck", family: "knowledgeCheck", variant: "multiple choice", items: [] },
            { id: "b3", type: "text", family: "text", items: [{ heading: "Lesson 2 heading", paragraph: "<p>B</p>" }] },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons).toHaveLength(2);
    const secondLessonBody = (result.modules[0].lessons[1].content as { body: string }).body;
    expect(secondLessonBody).toContain("<h2>Lesson 2 heading</h2>");
  });

  it("HTML-escapes a heading and a plain-text paragraph", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "text",
              family: "text",
              items: [{ heading: "A < B & C", paragraph: "Plain <not-a-tag> text" }],
            },
          ],
        },
      ])
    );
    const body = (result.modules[0].lessons[0].content as { body: string }).body;
    expect(body).toContain("<h2>A &lt; B &amp; C</h2>");
    expect(body).toContain("<p>Plain &lt;not-a-tag&gt; text</p>");
  });

  it("converts a bulleted list into a <ul>", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "list",
              family: "list",
              variant: "bulleted",
              items: [{ paragraph: "<p>First</p>" }, { paragraph: "<p>Second</p>" }],
            },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons[0]).toMatchObject({
      type: "text",
      content: { body: "<ul><li>First</li><li>Second</li></ul>" },
    });
  });

  it("a divider between two text blocks breaks the merge, not just skips itself", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            { id: "b1", type: "text", family: "text", items: [{ paragraph: "<p>One</p>" }] },
            { id: "b2", type: "divider", family: "continue", variant: "continue" },
            { id: "b3", type: "text", family: "text", items: [{ paragraph: "<p>Two</p>" }] },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons).toHaveLength(2);
    expect(result.modules[0].lessons[0]).toMatchObject({ content: { body: "<p>One</p>" } });
    expect(result.modules[0].lessons[1]).toMatchObject({ content: { body: "<p>Two</p>" }, order: 2 });
  });

  it("merges three directly-adjacent text/list blocks into one lesson", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            { id: "b1", type: "text", family: "text", items: [{ paragraph: "<p>One</p>" }] },
            { id: "b2", type: "list", family: "list", items: [{ number: "1", paragraph: "<p>Two</p>" }] },
            { id: "b3", type: "text", family: "impact", variant: "b", items: [{ paragraph: "<p>Three</p>" }] },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons).toEqual([
      expect.objectContaining({
        type: "text",
        content: { body: "<p>One</p>\n\n<ol><li>Two</li></ol>\n\n<p>Three</p>" },
        order: 1,
      }),
    ]);
  });

  it("a quiz between two text blocks breaks the merge and keeps its own order", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            { id: "b1", type: "text", family: "text", items: [{ paragraph: "<p>One</p>" }] },
            {
              id: "b2",
              type: "knowledgeCheck",
              family: "knowledgeCheck",
              variant: "multiple choice",
              items: [{ type: "MULTIPLE_CHOICE", title: "Q?", answers: [{ title: "A", correct: true }, { title: "B" }] }],
            },
            { id: "b3", type: "text", family: "text", items: [{ paragraph: "<p>Two</p>" }] },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons.map((l) => l.type)).toEqual(["text", "quiz", "text"]);
    expect(result.modules[0].lessons.map((l) => l.order)).toEqual([1, 2, 3]);
  });

  it("a skipped/unsupported block between two text blocks breaks the merge", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            { id: "b1", type: "text", family: "text", items: [{ paragraph: "<p>One</p>" }] },
            { id: "b2", type: "video", family: "video" },
            { id: "b3", type: "text", family: "text", items: [{ paragraph: "<p>Two</p>" }] },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons).toHaveLength(2);
    expect(result.skipped).toEqual([{ type: "video", family: "video", variant: undefined }]);
  });

  it("converts a flashcard block", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "interactive",
              family: "flashcard",
              variant: "flashcard",
              items: [{ front: { description: "<p>Q</p>" }, back: { description: "<p>A</p>" } }],
            },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons[0]).toMatchObject({ type: "flashcard", content: { cards: [{ front: "Q", back: "A" }] } });
  });

  it("converts accordion, tabs, and process blocks into accordion lessons", () => {
    const sectionItem = (id: string, variant: string) => ({
      id,
      type: "interactive",
      family: "interactive",
      variant,
      items: [{ title: "Sec", description: "<p>Body</p>" }],
    });
    const result = convertRiseCourse(
      riseCourse([
        { id: "l1", title: "M", items: [sectionItem("b1", "accordion"), sectionItem("b2", "tabs"), sectionItem("b3", "process")] },
      ])
    );
    expect(result.modules[0].lessons).toHaveLength(3);
    for (const lesson of result.modules[0].lessons) {
      expect(lesson).toMatchObject({ type: "accordion", content: { sections: [{ title: "Sec", body: "Body" }] } });
    }
  });

  it("converts a timeline block, prefixing the section title with its date", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "interactive",
              family: "interactive-fullscreen",
              variant: "timeline",
              items: [{ date: "Phase 1", title: "Kickoff", description: "<p>Start here.</p>" }],
            },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons[0]).toMatchObject({
      type: "accordion",
      content: { sections: [{ title: "Phase 1: Kickoff", body: "Start here." }] },
    });
  });

  it("converts a sorting block into a matching lesson using pile titles", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "interactive",
              family: "interactive-fullscreen",
              variant: "sorting",
              items: [
                { title: "Item A", pileId: "p1" },
                { title: "Item B", pileId: "p2" },
              ],
              piles: [
                { id: "p1", title: "Bucket 1" },
                { id: "p2", title: "Bucket 2" },
              ],
            },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons[0]).toMatchObject({
      type: "matching",
      content: {
        pairs: [
          { prompt: "Item A", match: "Bucket 1" },
          { prompt: "Item B", match: "Bucket 2" },
        ],
      },
    });
  });

  it("skips a sorting block that resolves to fewer than 2 valid pairs", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "interactive",
              family: "interactive-fullscreen",
              variant: "sorting",
              items: [{ title: "Item A", pileId: "p1" }],
              piles: [{ id: "p1", title: "Bucket 1" }],
            },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons).toHaveLength(0);
    expect(result.skipped).toEqual([{ type: "interactive", family: "interactive-fullscreen", variant: "sorting" }]);
  });

  it("converts a multiple-choice knowledge check into a quiz lesson", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "knowledgeCheck",
              family: "knowledgeCheck",
              variant: "multiple choice",
              items: [
                {
                  type: "MULTIPLE_CHOICE",
                  title: "Which one?",
                  answers: [
                    { title: "A", correct: false },
                    { title: "B", correct: true },
                  ],
                },
              ],
            },
          ],
        },
      ])
    );
    expect(result.modules[0].lessons[0]).toMatchObject({
      type: "quiz",
      content: { questions: [{ prompt: "Which one?", options: ["A", "B"], correctIndex: 1 }] },
    });
  });

  it("flattens a multiple-response knowledge check to text, naming the correct answers", () => {
    const result = convertRiseCourse(
      riseCourse([
        {
          id: "l1",
          title: "M",
          items: [
            {
              id: "b1",
              type: "knowledgeCheck",
              family: "knowledgeCheck",
              variant: "multiple response",
              items: [
                {
                  type: "MULTIPLE_RESPONSE",
                  title: "Pick all that apply",
                  answers: [
                    { title: "A", correct: true },
                    { title: "B", correct: false },
                    { title: "C", correct: true },
                  ],
                },
              ],
            },
          ],
        },
      ])
    );
    const lesson = result.modules[0].lessons[0];
    expect(lesson.type).toBe("text");
    expect((lesson as { content: { body: string } }).content.body).toContain("Correct: A; C");
  });

  it("tracks unrecognized block types as skipped instead of throwing", () => {
    const result = convertRiseCourse(
      riseCourse([{ id: "l1", title: "M", items: [{ id: "b1", type: "video", family: "video" }] }])
    );
    expect(result.modules[0].lessons).toHaveLength(0);
    expect(result.skipped).toEqual([{ type: "video", family: "video", variant: undefined }]);
  });
});
