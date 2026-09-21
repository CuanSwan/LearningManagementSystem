import { z } from "zod";
import { sanitizeHtml } from "./sanitizeHtml.js";
import { ThemeOverrideSchema } from "./theme.js";

export const LessonSourceSchema = z.enum(["human", "ai_generated"]);
export type LessonSource = z.infer<typeof LessonSourceSchema>;

export const WordingStyleSchema = z.enum(["official", "shortened"]);
export type WordingStyle = z.infer<typeof WordingStyleSchema>;

export const ModuleStatusSchema = z.enum(["draft", "ai_generated", "published"]);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

const TextContentSchema = z.object({
  // Rich markup from the admin's text editor (headings, lists, emphasis,
  // etc.), sanitized on parse for the same reason CustomHtmlContentSchema
  // below is - every write path (API, seed data, the Rise importer) goes
  // through this schema, so none of them can forget to sanitize.
  body: z.string().transform((html) => sanitizeHtml(html)),
});

const VideoContentSchema = z.object({
  videoUrl: z.string(),
  transcript: z.string().optional(),
  duration: z.number().nonnegative().optional(),
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

const CustomHtmlContentSchema = z.object({
  // Sanitized as part of parsing itself, not in a separate step someone
  // could forget to call - every write path (create, save, seed, the Rise
  // importer) goes through parseModule/LessonSchema, so every one of them
  // gets this for free.
  html: z.string().transform((html) => sanitizeHtml(html)),
});

const EmbedContentSchema = z.object({
  // http(s) only - anything else (javascript:, data:) is a known iframe-src
  // XSS vector, not just an unsanitized-content problem.
  url: z.string().url().refine((u) => /^https?:\/\//i.test(u), "Embed URL must start with http:// or https://"),
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
export type CustomHtmlLesson = z.infer<typeof CustomHtmlLessonSchema>;
export type EmbedLesson = z.infer<typeof EmbedLessonSchema>;
export type ExamBreakdownLesson = z.infer<typeof ExamBreakdownLessonSchema>;
export type LessonType = Lesson["type"];

export const ModuleSeedSchema = z.object({
  title: z.string(),
  objective: z.string(),
  authorNotes: z.string().optional(),
  rawContent: z.string().optional(),
});

export const ModuleSchema = z.object({
  moduleId: z.string(),
  // Absent when the module isn't (or is no longer) part of any course - see
  // `category` below, which is how such a module still gets placed in the
  // admin library tree.
  courseId: z.string().optional(),
  // Only meaningful when courseId is absent: the category the module was
  // removed from (or created under) via the library, so it still has a home
  // in the tree without a course to look the category up from.
  category: z.string().optional(),
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
  description: z.string().optional(),
  category: z.string().optional(),
  // Only the fields this course chooses to override - see Theme.withOverrides() on the client.
  theme: ThemeOverrideSchema.default({}),
});

export type Course = z.infer<typeof CourseSchema>;

export function parseCourse(data: unknown): Course {
  return CourseSchema.parse(data);
}

export const LearningPathSchema = z.object({
  pathId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  // Ordered - a student moves through these courses one by one.
  courseIds: z.array(z.string()).default([]),
});

export type LearningPath = z.infer<typeof LearningPathSchema>;

export function parseLearningPath(data: unknown): LearningPath {
  return LearningPathSchema.parse(data);
}
