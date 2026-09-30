import { JSDOM } from "jsdom";
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

// Flattens Rise HTML down to plain text (for fields that render as plain
// strings, not markup - flashcard faces, accordion/timeline section bodies,
// course/module descriptions). Parsed the same way as riseWrapperElements
// rather than a tag-stripping regex, for the same two reasons: a regex like
// /<[^>]+>/g strips literal text that merely looks like a tag along with
// real tags, and it only knows the handful of entities (&nbsp;, &amp;, ...)
// someone thought to list, silently leaving any other real entity Rise
// emits (&rsquo;, &hellip;, &mdash;, ...) sitting in the output unescaped -
// `textContent` decodes all of them correctly. Each top-level node's text is
// joined with a paragraph break so multiple blocks don't run together with
// no separator.
function stripHtml(html: string | undefined): string {
  if (!html) return "";
  const fragment = JSDOM.fragment(html);
  const blocks = Array.from(fragment.childNodes)
    .map((node) => (node.textContent ?? "").trim())
    .filter(Boolean);
  return blocks.join("\n\n");
}

// Every converted lesson needs a title regardless of type (see
// LessonBaseSchema) - Rise doesn't give blocks one directly, so this derives
// a short one from whatever text the block already has (a heading, a
// question prompt, a section title, ...), falling back to a generic label
// naming the kind of block when there's nothing suitable to pull from.
function titleFromText(text: string | undefined, fallback: string, max = 60): string {
  const plain = stripHtml(text).replace(/\s+/g, " ").trim();
  if (!plain) return fallback;
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}...` : plain;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Rise's rich-text fields (`paragraph`, `heading`, list items) come through
// wrapped in `<p>...</p>` or `<div>...</div>` about as often as they're
// plain text, inconsistently, even within the same course. Parsed with a
// real DOM (jsdom) rather than a regex, so this can't be fooled by:
//  - a field that happens to contain literal "<" text that merely looks
//    like a tag (e.g. Rise's own `<not-a-tag>` in one of our tests) - a
//    regex like /^<p[^>]*>.../ can't tell that apart from a real element,
//    but a real HTML parser only produces an Element for real markup.
//  - sibling wrapper tags, e.g. "<div>A</div><div>B</div>" - a regex
//    anchored on the first open tag and last close tag greedily captures
//    "A</div><div>B" as if it were one wrapper's contents; parsing finds
//    two distinct top-level elements instead.
// Returns each top-level element only when every non-blank top-level node
// is a <p> or <div> (Rise's only observed wrapper tags) - anything else
// (plain text, or a mix of text and tags) is treated as plain text.
function riseWrapperElements(html: string): Element[] | null {
  const fragment = JSDOM.fragment(html);
  const nodes = Array.from(fragment.childNodes).filter(
    (node) => node.nodeType !== node.TEXT_NODE || (node.textContent ?? "").trim() !== ""
  );
  if (nodes.length === 0) return null;
  const isWrapper = (node: ChildNode): node is Element =>
    node.nodeType === node.ELEMENT_NODE && ((node as Element).tagName === "P" || (node as Element).tagName === "DIV");
  return nodes.every(isWrapper) ? (nodes as Element[]) : null;
}

// Pass an already-wrapped paragraph through untouched (it'll still go
// through sanitizeHtml downstream) and escape+wrap plain text so it renders
// as its own block instead of a stray line with no paragraph boundary.
function asParagraphHtml(raw: string | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return riseWrapperElements(trimmed) ? trimmed : `<p>${escapeHtml(trimmed)}</p>`;
}

// A wrapped field's inner markup, for use inside a tag that's already
// block-level and doesn't need a nested <p>/<div> (an <li>, or a heading).
// A field with no wrapping is assumed to be plain text and escaped, same as
// asParagraphHtml does for a bare paragraph.
function unwrapBlockHtml(raw: string | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const wrappers = riseWrapperElements(trimmed);
  if (wrappers) return wrappers.map((el) => el.innerHTML).join("");
  return escapeHtml(trimmed);
}

// Rise only tells us "this block has a heading or not" - no heading level.
// Every heading block-conversion emits <h2> uniformly; once a lesson's
// merged blocks are all assembled, demoteExtraHeadings (below) downgrades
// every heading after the first to <h3>, so a merged run of several
// Rise blocks reads as one heading with subheadings rather than a wall of
// same-level headings.
//
// Like `paragraph`, Rise's `heading` field is sometimes plain text and
// sometimes already `<p>...</p>`-wrapped HTML - escaping it unconditionally
// turned a real `<p>` around an HTML-flavored heading into literal visible
// "<p>...</p>" text once rendered, instead of the escape only being applied
// to genuine plain text (see unwrapBlockHtml).
function headingHtml(text: string): string {
  return `<h2>${unwrapBlockHtml(text)}</h2>`;
}

function demoteExtraHeadings(html: string): string {
  let seenFirst = false;
  return html.replace(/<h2>([\s\S]*?)<\/h2>/g, (match, inner: string) => {
    if (!seenFirst) {
      seenFirst = true;
      return match;
    }
    return `<h3>${inner}</h3>`;
  });
}

// Everything that comes through this importer is machine-converted from a
// Rise export, regardless of whether a human or AI originally authored it
// inside Rise - from this app's perspective, no human typed it in here, so
// it's tagged accordingly rather than trying to infer authorship from Rise's
// own (unreliable, and no longer read) per-block metadata.
const RISE_AUTHORSHIP: { source: LessonSource; wordingStyle: WordingStyle } = {
  source: "ai_generated",
  wordingStyle: "shortened",
};

type LessonBase = { lessonId: string; schemaVersion: number; source: LessonSource; wordingStyle: WordingStyle; order: number };

// LessonBase above deliberately excludes title - see the per-block
// derivations in convertBlock, each picking whatever field on that block
// actually reads as a title, rather than a single generic rule.

function convertBlock(block: RiseBlock, base: LessonBase, skipped: SkippedBlock[]): Lesson | null {
  // Pure "Continue" button chrome between screens - no content to carry over.
  if (block.type === "divider") return null;

  if (block.type === "text" && block.family === "text") {
    const items = (block.items ?? []) as RiseTextItem[];
    const body = items
      .map((sub) => [sub.heading ? headingHtml(sub.heading) : "", asParagraphHtml(sub.paragraph)].join(""))
      .filter(Boolean)
      .join("\n\n");
    if (!body) return null;
    const title = titleFromText(items[0]?.heading ?? items[0]?.paragraph, "Text");
    return { ...base, title, type: "text", content: { body } };
  }

  if (block.type === "text" && block.family === "impact") {
    const items = (block.items ?? []) as RiseTextItem[];
    const body = items
      .map((sub) => asParagraphHtml(sub.paragraph))
      .filter(Boolean)
      .join("\n\n");
    if (!body) return null;
    const title = titleFromText(items[0]?.paragraph, "Text");
    return { ...base, title, type: "text", content: { body } };
  }

  if (block.type === "list") {
    const items = (block.items ?? []) as RiseListItem[];
    const listItems = items.map((sub) => unwrapBlockHtml(sub.paragraph)).filter(Boolean);
    if (listItems.length === 0) return null;
    const tag = block.variant === "bulleted" ? "ul" : "ol";
    const body = `<${tag}>${listItems.map((li) => `<li>${li}</li>`).join("")}</${tag}>`;
    const title = titleFromText(items[0]?.paragraph, "List");
    return { ...base, title, type: "text", content: { body } };
  }

  if (block.type === "interactive" && block.family === "flashcard") {
    const items = (block.items ?? []) as RiseFlashcardItem[];
    const cards = items
      .map((card) => ({ front: stripHtml(card.front?.description), back: stripHtml(card.back?.description) }))
      .filter((c) => c.front || c.back);
    if (cards.length === 0) return null;
    return { ...base, title: "Flashcards", type: "flashcard", content: { cards } };
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
    return { ...base, title: titleFromText(sections[0]?.title, "Accordion"), type: "accordion", content: { sections } };
  }

  if (block.type === "interactive" && block.family === "interactive-fullscreen" && block.variant === "timeline") {
    const items = (block.items ?? []) as RiseSectionItem[];
    const sections = items
      .map((sub) => ({ title: [sub.date, sub.title].filter(Boolean).join(": "), body: stripHtml(sub.description) }))
      .filter((s) => s.title || s.body);
    if (sections.length === 0) return null;
    return { ...base, title: titleFromText(sections[0]?.title, "Timeline"), type: "accordion", content: { sections } };
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
    return { ...base, title: "Matching", type: "matching", content: { pairs } };
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
      return { ...base, title: titleFromText(questions[0]?.prompt, "Quiz"), type: "quiz", content: { questions } };
    }
    // Our quiz schema only supports a single correct answer per question -
    // a multi-select knowledge check would be misrepresented as single-choice,
    // so it's flattened to text (naming the correct answers) instead.
    if (first?.type === "MULTIPLE_RESPONSE" && first.title) {
      const correct = (first.answers ?? []).filter((a) => a.correct).map((a) => a.title);
      const body = [
        asParagraphHtml("[Converted from a multi-select knowledge check - interactivity lost]"),
        asParagraphHtml(first.title),
        correct.length ? asParagraphHtml(`Correct: ${correct.join("; ")}`) : "",
      ]
        .filter(Boolean)
        .join("\n\n");
      return { ...base, title: titleFromText(first.title, "Knowledge Check"), type: "text", content: { body } };
    }
  }

  skipped.push({ type: block.type, family: block.family, variant: block.variant });
  return null;
}

function convertLesson(riseLesson: RiseLesson, skipped: SkippedBlock[]): ConvertedModule {
  // Rise deliberately splits content into short, single-idea text blocks
  // (its authoring pattern, not a conversion artifact - see the "why are
  // lessons so short" conversation). That reads as choppy once flattened
  // into a plain lesson list, so raw blocks that are both text AND directly
  // adjacent in the original block order are merged into one fuller lesson.
  // A divider or an unsupported/skipped block still breaks the run even
  // though it produces no lesson itself - it represents a deliberate pacing
  // break (or at least "something else was here") in the original course,
  // and merging across it would splice together text that was never meant
  // to read as one continuous passage.
  const lessons: Lesson[] = [];
  let order = 1;
  let lastWasMergeableText = false;
  for (const block of riseLesson.items ?? []) {
    const base: LessonBase = { lessonId: `rise-${block.id}`, schemaVersion: 1, ...RISE_AUTHORSHIP, order };
    const converted = convertBlock(block, base, skipped);

    if (!converted) {
      lastWasMergeableText = false;
      continue;
    }

    if (converted.type === "text" && lastWasMergeableText) {
      const last = lessons[lessons.length - 1] as Extract<Lesson, { type: "text" }>;
      last.content = { body: [last.content.body, converted.content.body].filter(Boolean).join("\n\n") };
    } else {
      lessons.push(converted);
      order++;
    }
    lastWasMergeableText = converted.type === "text";
  }

  return {
    title: riseLesson.title ?? "Untitled module",
    // No fallback text naming Rise here - this is a student-visible field
    // (see StudentCourse/StudentModule/EmbedModule), and where a course came
    // from is admin-only information (Course.importedFrom, shown only on
    // admin pages), not something to leak into the module description.
    objective: stripHtml(riseLesson.description) || "",
    lessons: lessons.map((lesson, i) => {
      const positioned = { ...lesson, order: i + 1 };
      // Only demote after all merging is done - a merge run's later blocks'
      // headings should read as subheadings under the run's first heading,
      // not as same-level headings scattered through one lesson.
      return positioned.type === "text"
        ? { ...positioned, content: { body: demoteExtraHeadings(positioned.content.body) } }
        : positioned;
    }),
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
