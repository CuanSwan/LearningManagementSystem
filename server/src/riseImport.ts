import type { Lesson, LessonSource, WordingStyle } from "./schemas.js";

// Loose types for the parts of Rise 360's undocumented internal export
// format that we actually read. Reverse-engineered from a real export's
// runtime-data.js - Rise doesn't publish a schema for this, so these are
// deliberately permissive (everything but `id`/`type` is optional) rather
// than a strict model of a format that could shift under us.
interface RiseAnswer {
  title?: string;
  correct?: boolean;
}

interface RiseKnowledgeCheckItem {
  type?: string;
  title?: string;
  answers?: RiseAnswer[];
}

interface RiseTextItem {
  heading?: string;
  paragraph?: string;
}

interface RiseListItem {
  number?: string;
  paragraph?: string;
}

interface RiseFlashcardItem {
  front?: { description?: string };
  back?: { description?: string };
}

interface RiseSectionItem {
  title?: string;
  description?: string;
  date?: string;
}

interface RiseSortingItem {
  title?: string;
  pileId?: string;
}

interface RiseSortingPile {
  id: string;
  title?: string;
}

interface RiseBlock {
  id: string;
  type: string;
  family?: string;
  variant?: string;
  metadata?: { createdVia?: string };
  items?: unknown[];
  piles?: RiseSortingPile[];
}

interface RiseLesson {
  id: string;
  title?: string;
  description?: string;
  items?: RiseBlock[];
}

interface RiseCourse {
  title?: string;
  description?: string;
  lessons?: RiseLesson[];
}

export interface SkippedBlock {
  type: string;
  family?: string;
  variant?: string;
}

export interface ConvertedModule {
  title: string;
  objective: string;
  lessons: Lesson[];
}

export interface ConvertedCourse {
  title: string;
  description: string;
  modules: ConvertedModule[];
  skipped: SkippedBlock[];
}

export class RiseImportError extends Error {}

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function authorshipFor(block: RiseBlock): { source: LessonSource; wordingStyle: WordingStyle } {
  const source: LessonSource = block.metadata?.createdVia === "ai" ? "ai_generated" : "human";
  const wordingStyle: WordingStyle = source === "ai_generated" ? "shortened" : "official";
  return { source, wordingStyle };
}

type LessonBase = { lessonId: string; schemaVersion: number; source: LessonSource; wordingStyle: WordingStyle; order: number };

function convertBlock(block: RiseBlock, base: LessonBase, skipped: SkippedBlock[]): Lesson | null {
  // Pure "Continue" button chrome between screens - no content to carry over.
  if (block.type === "divider") return null;

  if (block.type === "text" && block.family === "text") {
    const items = (block.items ?? []) as RiseTextItem[];
    const body = items
      .map((sub) => [sub.heading, stripHtml(sub.paragraph)].filter(Boolean).join("\n\n"))
      .filter(Boolean)
      .join("\n\n");
    if (!body) return null;
    return { ...base, type: "text", content: { body } };
  }

  if (block.type === "text" && block.family === "impact") {
    const items = (block.items ?? []) as RiseTextItem[];
    const body = items
      .map((sub) => stripHtml(sub.paragraph))
      .filter(Boolean)
      .join("\n\n");
    if (!body) return null;
    return { ...base, type: "text", content: { body } };
  }

  if (block.type === "list") {
    const items = (block.items ?? []) as RiseListItem[];
    const body = items.map((sub) => `${sub.number ?? ""}. ${stripHtml(sub.paragraph)}`).join("\n");
    if (!body) return null;
    return { ...base, type: "text", content: { body } };
  }

  if (block.type === "interactive" && block.family === "flashcard") {
    const items = (block.items ?? []) as RiseFlashcardItem[];
    const cards = items
      .map((card) => ({ front: stripHtml(card.front?.description), back: stripHtml(card.back?.description) }))
      .filter((c) => c.front || c.back);
    if (cards.length === 0) return null;
    return { ...base, type: "flashcard", content: { cards } };
  }

  // Accordion, tabs, timeline, and process are all, structurally, an ordered
  // list of titled sections - Rise just renders them with different chrome
  // (expand/collapse vs. tab strip vs. a horizontal timeline vs. numbered
  // steps). Our schema only has one "titled sections" lesson type, so all
  // four map onto accordion rather than losing them to flattened text.
  if (
    block.type === "interactive" &&
    (block.variant === "accordion" || block.variant === "tabs" || block.variant === "process")
  ) {
    const items = (block.items ?? []) as RiseSectionItem[];
    const sections = items
      .map((sub) => ({ title: sub.title ?? "", body: stripHtml(sub.description) }))
      .filter((s) => s.title || s.body);
    if (sections.length === 0) return null;
    return { ...base, type: "accordion", content: { sections } };
  }

  if (block.type === "interactive" && block.family === "interactive-fullscreen" && block.variant === "timeline") {
    const items = (block.items ?? []) as RiseSectionItem[];
    const sections = items
      .map((sub) => ({ title: [sub.date, sub.title].filter(Boolean).join(": "), body: stripHtml(sub.description) }))
      .filter((s) => s.title || s.body);
    if (sections.length === 0) return null;
    return { ...base, type: "accordion", content: { sections } };
  }

  // A "sort these items into buckets" exercise - each item belongs to one
  // named pile, which is exactly an {item, category} pair, i.e. our
  // matching lesson type.
  if (block.type === "interactive" && block.family === "interactive-fullscreen" && block.variant === "sorting") {
    const items = (block.items ?? []) as RiseSortingItem[];
    const piles = block.piles ?? [];
    const pileTitleById = new Map(piles.map((p) => [p.id, p.title ?? ""]));
    const pairs = items
      .map((sub) => ({ prompt: sub.title ?? "", match: sub.pileId ? (pileTitleById.get(sub.pileId) ?? "") : "" }))
      .filter((p) => p.prompt && p.match);
    if (pairs.length < 2) {
      skipped.push({ type: block.type, family: block.family, variant: block.variant });
      return null;
    }
    return { ...base, type: "matching", content: { pairs } };
  }

  if (block.type === "knowledgeCheck") {
    const items = (block.items ?? []) as RiseKnowledgeCheckItem[];
    const first = items[0];
    if (first?.type === "MULTIPLE_CHOICE") {
      const questions = items.map((q) => {
        const answers = q.answers ?? [];
        const correctIndex = Math.max(
          0,
          answers.findIndex((a) => a.correct)
        );
        return { prompt: q.title ?? "", options: answers.map((a) => a.title ?? ""), correctIndex };
      });
      return { ...base, type: "quiz", content: { questions } };
    }
    // Our quiz schema only supports a single correct answer per question -
    // a multi-select knowledge check would be misrepresented as single-choice,
    // so it's flattened to text (naming the correct answers) instead.
    if (first?.type === "MULTIPLE_RESPONSE" && first.title) {
      const correct = (first.answers ?? []).filter((a) => a.correct).map((a) => a.title);
      const body = [
        "[Converted from a multi-select knowledge check - interactivity lost]",
        first.title,
        correct.length ? `Correct: ${correct.join("; ")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      return { ...base, type: "text", content: { body } };
    }
  }

  skipped.push({ type: block.type, family: block.family, variant: block.variant });
  return null;
}

function convertLesson(riseLesson: RiseLesson, skipped: SkippedBlock[]): ConvertedModule {
  const lessons: Lesson[] = [];
  let order = 1;
  for (const block of riseLesson.items ?? []) {
    const { source, wordingStyle } = authorshipFor(block);
    const base: LessonBase = { lessonId: `rise-${block.id}`, schemaVersion: 1, source, wordingStyle, order };
    const converted = convertBlock(block, base, skipped);
    if (converted) {
      lessons.push(converted);
      order++;
    }
  }
  return {
    title: riseLesson.title ?? "Untitled module",
    objective: stripHtml(riseLesson.description) || "Imported from Rise 360.",
    lessons,
  };
}

export function convertRiseCourse(raw: unknown): ConvertedCourse {
  if (!raw || typeof raw !== "object" || !("course" in raw)) {
    throw new RiseImportError("This doesn't look like Rise course data - no 'course' field found.");
  }
  const course = (raw as { course: unknown }).course as RiseCourse | undefined;
  if (!course || !Array.isArray(course.lessons)) {
    throw new RiseImportError("This doesn't look like Rise course data - no 'course.lessons' array found.");
  }
  if (course.lessons.length === 0) {
    throw new RiseImportError("This Rise course has no lessons to import.");
  }

  const skipped: SkippedBlock[] = [];
  const modules = course.lessons.map((lesson) => convertLesson(lesson, skipped));

  return {
    title: course.title ?? "Imported course",
    description: stripHtml(course.description),
    modules,
    skipped,
  };
}
