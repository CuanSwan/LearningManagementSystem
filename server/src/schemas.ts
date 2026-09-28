import { z } from "zod";
import { sanitizeHtml } from "./sanitizeHtml.js";
import { ThemeOverrideSchema } from "./theme.js";

export const LessonSourceSchema = z.enum(["human", "ai_generated"]);
export type LessonSource = z.infer<typeof LessonSourceSchema>;

export const WordingStyleSchema = z.enum(["official", "shortened"]);
export type WordingStyle = z.infer<typeof WordingStyleSchema>;

export const ModuleStatusSchema = z.enum(["draft", "ai_generated", "published"]);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

export const CourseStatusSchema = z.enum(["draft", "published"]);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

// Every schema below that's persisted (module, course, learning path) can
// have any of its optional fields read back from Mongo as a literal `null`
// instead of genuinely absent - the driver used to silently turn an
// undefined-valued field into BSON null on write, before ignoreUndefined
// was set on the client (see db/index.ts). Plain `.optional()` only ever
// accepted undefined, not null, so a document already affected by this
// would fail Zod validation - and since a save round-trips whatever a
// previous read returned, that meant it could never be saved again either.
// This normalizes null back to undefined so already-stored data keeps
// working without a migration.
function nullableOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullish().transform((val) => val ?? undefined);
}

const TextContentSchema = z.object({
  // Rich markup from the admin's text editor (headings, lists, emphasis,
  // etc.), sanitized on parse for the same reason CustomHtmlContentSchema
  // below is - every write path (API, seed data, the Rise importer) goes
  // through this schema, so none of them can forget to sanitize.
  body: z.string().transform((html) => sanitizeHtml(html)),
});

const VideoContentSchema = z.object({
  videoUrl: z.string(),
  transcript: nullableOptional(z.string()),
  duration: nullableOptional(z.number().nonnegative()),
});

const QuizContentSchema = z.object({
  questions: z
    .array(
      z.object({
        prompt: z.string(),
        options: z.array(z.string()).min(2),
        correctIndex: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

const PracticalContentSchema = z.object({
  instructions: z.string(),
  steps: z.array(z.string()),
  submissionType: z.enum(["text", "file", "checklist"]),
});

const DiagramContentSchema = z.object({
  imageUrl: z.string(),
});

const FlashcardContentSchema = z.object({
  cards: z.array(z.object({ front: z.string(), back: z.string() })).min(1),
});

const AccordionContentSchema = z.object({
  sections: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
});

const MatchingContentSchema = z.object({
  pairs: z.array(z.object({ prompt: z.string(), match: z.string() })).min(2),
});

// The number of stages *is* the number of circles on the dial - there's no
// separate "circle count" field, it's just stages.length. At least 2 so the
// dial has something to step between; at most 20 so the ring stays legible
// even as each node's size shrinks to fit them all.
const DialContentSchema = z.object({
  stages: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(20),
});

// A horizontal progress track - the same one-title-one-body-per-step shape
// as the dial, just capped much lower (7) since every step's label sits
// inline in a single row rather than shrinking into a small ring.
const PipelineContentSchema = z.object({
  steps: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(7),
});

// A "presentation mode" dial - unlike the dial above, which rings every
// stage around the circle at once, this only ever shows a 4-wide trailing
// window of stages ending at the current one, navigated with prev/next
// rather than by clicking a stage directly. Same title/body-per-stage
// shape and the same 2-20 bounds as the dial, since it's stepping
// through the same kind of content, just windowed instead of full-ring.
const PresentationDialContentSchema = z.object({
  stages: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(20),
});

// A grid of comparison cards, always laid out 3 per row and wrapping (and
// centering incomplete rows) beyond that - so at least 2 cards, since
// comparing needs something to compare against, and no upper cap since
// extra cards just add rows rather than crowding a fixed shape.
const CardGridContentSchema = z.object({
  cards: z
    .array(
      z.object({
        title: z.string(),
        useWhen: z.string(),
        looksLike: z.string(),
        noteLabel: z.string(),
        noteBody: z.string(),
      })
    )
    .min(2),
});

// A grid of clickable tiles (5 per row, wrapping and centering beyond
// that, like the card grid), each popping open a note above itself on
// click. At least 2 to be worth a grid; no upper cap since extra tiles
// just add rows rather than crowding a fixed shape.
const HotspotsContentSchema = z.object({
  tiles: z.array(z.object({ title: z.string(), body: z.string(), example: z.string() })).min(2),
});

// A scroll-scrubbed tree: node 0 is always the root, and every other
// node names its parent by array index. Requiring parentIndex < the
// node's own index makes a cycle structurally impossible (a node can
// only point at an already-defined, earlier node) and gives siblings
// under the same parent for free - any number of nodes can share a
// parentIndex, and the client's layout fans them out by angle instead
// of stacking them. At least 2 (a lone root isn't a tree); capped at
// 20 since the client renders every node's own screen position, and a
// tree that large needs the zoom-on-scroll behavior to stay legible.
const TreeScrubContentSchema = z.object({
  nodes: z
    .array(z.object({ title: z.string(), body: z.string(), parentIndex: z.number().int().nonnegative() }))
    .min(2)
    .max(20)
    .superRefine((nodes, ctx) => {
      nodes.forEach((node, i) => {
        if (i === 0) return;
        if (node.parentIndex >= i) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Node ${i}'s parentIndex must reference an earlier node (got ${node.parentIndex})`,
            path: [i, "parentIndex"],
          });
        }
      });
    }),
});

const CustomHtmlContentSchema = z.object({
  // Sanitized as part of parsing itself, not in a separate step someone
  // could forget to call - every write path (create, save, seed, the Rise
  // importer) goes through parseModule/LessonSchema, so every one of them
  // gets this for free.
  html: z.string().transform((html) => sanitizeHtml(html)),
});

const EmbedContentSchema = z.object({
  // Empty is allowed - it's the blank-lesson factory's starting state, same
  // as every other lesson type's content, and a module has to be saveable
  // as a draft before the admin has filled it in. Once non-empty, though,
  // http(s) only - anything else (javascript:, data:) is a known iframe-src
  // XSS vector, not just an unsanitized-content problem.
  url: z
    .string()
    .refine(
      (u) => u === "" || (/^https?:\/\//i.test(u) && z.string().url().safeParse(u).success),
      "Embed URL must start with http:// or https://"
    ),
});

const ExamBreakdownContentSchema = z.object({
  passMarkPercent: z.number().min(0).max(100),
  timeLimitMinutes: z.number().int().positive(),
  questionCount: z.number().int().positive(),
  openBook: z.boolean(),
});

const LessonBaseSchema = z.object({
  lessonId: z.string(),
  schemaVersion: z.number().int().positive(),
  source: LessonSourceSchema,
  wordingStyle: WordingStyleSchema,
  order: z.number().int().nonnegative(),
});

export const TextLessonSchema = LessonBaseSchema.extend({
  type: z.literal("text"),
  content: TextContentSchema,
});

export const VideoLessonSchema = LessonBaseSchema.extend({
  type: z.literal("video"),
  content: VideoContentSchema,
});

export const QuizLessonSchema = LessonBaseSchema.extend({
  type: z.literal("quiz"),
  content: QuizContentSchema,
});

export const PracticalLessonSchema = LessonBaseSchema.extend({
  type: z.literal("practical"),
  content: PracticalContentSchema,
});

export const DiagramLessonSchema = LessonBaseSchema.extend({
  type: z.literal("diagram"),
  content: DiagramContentSchema,
});

export const FlashcardLessonSchema = LessonBaseSchema.extend({
  type: z.literal("flashcard"),
  content: FlashcardContentSchema,
});

export const AccordionLessonSchema = LessonBaseSchema.extend({
  type: z.literal("accordion"),
  content: AccordionContentSchema,
});

export const MatchingLessonSchema = LessonBaseSchema.extend({
  type: z.literal("matching"),
  content: MatchingContentSchema,
});

export const DialLessonSchema = LessonBaseSchema.extend({
  type: z.literal("dial"),
  content: DialContentSchema,
});

export const PipelineLessonSchema = LessonBaseSchema.extend({
  type: z.literal("pipeline"),
  content: PipelineContentSchema,
});

export const PresentationDialLessonSchema = LessonBaseSchema.extend({
  type: z.literal("presentationDial"),
  content: PresentationDialContentSchema,
});

export const CardGridLessonSchema = LessonBaseSchema.extend({
  type: z.literal("cardGrid"),
  content: CardGridContentSchema,
});

export const HotspotsLessonSchema = LessonBaseSchema.extend({
  type: z.literal("hotspots"),
  content: HotspotsContentSchema,
});

export const TreeScrubLessonSchema = LessonBaseSchema.extend({
  type: z.literal("treeScrub"),
  content: TreeScrubContentSchema,
});

export const CustomHtmlLessonSchema = LessonBaseSchema.extend({
  type: z.literal("html"),
  content: CustomHtmlContentSchema,
});

export const EmbedLessonSchema = LessonBaseSchema.extend({
  type: z.literal("embed"),
  content: EmbedContentSchema,
});

export const ExamBreakdownLessonSchema = LessonBaseSchema.extend({
  type: z.literal("examBreakdown"),
  content: ExamBreakdownContentSchema,
});

export const LessonSchema = z.discriminatedUnion("type", [
  TextLessonSchema,
  VideoLessonSchema,
  QuizLessonSchema,
  PracticalLessonSchema,
  DiagramLessonSchema,
  FlashcardLessonSchema,
  AccordionLessonSchema,
  MatchingLessonSchema,
  DialLessonSchema,
  PipelineLessonSchema,
  PresentationDialLessonSchema,
  CardGridLessonSchema,
  HotspotsLessonSchema,
  TreeScrubLessonSchema,
  CustomHtmlLessonSchema,
  EmbedLessonSchema,
  ExamBreakdownLessonSchema,
]);

export type Lesson = z.infer<typeof LessonSchema>;
export type TextLesson = z.infer<typeof TextLessonSchema>;
export type VideoLesson = z.infer<typeof VideoLessonSchema>;
export type QuizLesson = z.infer<typeof QuizLessonSchema>;
export type PracticalLesson = z.infer<typeof PracticalLessonSchema>;
export type DiagramLesson = z.infer<typeof DiagramLessonSchema>;
export type FlashcardLesson = z.infer<typeof FlashcardLessonSchema>;
export type AccordionLesson = z.infer<typeof AccordionLessonSchema>;
export type MatchingLesson = z.infer<typeof MatchingLessonSchema>;
export type DialLesson = z.infer<typeof DialLessonSchema>;
export type PipelineLesson = z.infer<typeof PipelineLessonSchema>;
export type PresentationDialLesson = z.infer<typeof PresentationDialLessonSchema>;
export type CardGridLesson = z.infer<typeof CardGridLessonSchema>;
export type HotspotsLesson = z.infer<typeof HotspotsLessonSchema>;
export type TreeScrubLesson = z.infer<typeof TreeScrubLessonSchema>;
export type CustomHtmlLesson = z.infer<typeof CustomHtmlLessonSchema>;
export type EmbedLesson = z.infer<typeof EmbedLessonSchema>;
export type ExamBreakdownLesson = z.infer<typeof ExamBreakdownLessonSchema>;
export type LessonType = Lesson["type"];

export const ModuleSeedSchema = z.object({
  title: z.string(),
  objective: z.string(),
  authorNotes: nullableOptional(z.string()),
  rawContent: nullableOptional(z.string()),
});

export const ModuleSchema = z.object({
  moduleId: z.string(),
  // Absent when the module isn't (or is no longer) part of any course - see
  // `category` below, which is how such a module still gets placed in the
  // admin library tree.
  courseId: nullableOptional(z.string()),
  // Only meaningful when courseId is absent: the category the module was
  // removed from (or created under) via the library, so it still has a home
  // in the tree without a course to look the category up from.
  category: nullableOptional(z.string()),
  status: ModuleStatusSchema,
  seed: ModuleSeedSchema,
  lessons: z.array(LessonSchema),
});

export type Module = z.infer<typeof ModuleSchema>;

export function parseModule(data: unknown): Module {
  return ModuleSchema.parse(data);
}

export const CourseSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  description: nullableOptional(z.string()),
  category: nullableOptional(z.string()),
  // Only the fields this course chooses to override - see Theme.withOverrides() on the client.
  theme: ThemeOverrideSchema.default({}),
  // Same idea as a module's status - a course starts as a draft, invisible
  // to anyone but admins/super_admins/reviewers, until explicitly published
  // (see userHasCourseAccess). Defaults to "draft" rather than requiring
  // every course-creation call site to say so explicitly, the same way
  // `theme` above defaults to no overrides.
  status: CourseStatusSchema.default("draft"),
});

export type Course = z.infer<typeof CourseSchema>;

export function parseCourse(data: unknown): Course {
  return CourseSchema.parse(data);
}

export const LearningPathSchema = z.object({
  pathId: z.string(),
  title: z.string(),
  description: nullableOptional(z.string()),
  // Ordered - a student moves through these courses one by one.
  courseIds: z.array(z.string()).default([]),
});

export type LearningPath = z.infer<typeof LearningPathSchema>;

export function parseLearningPath(data: unknown): LearningPath {
  return LearningPathSchema.parse(data);
}
