import { z } from "zod";
import { ThemeOverrideSchema } from "./theme.js";

export const LessonSourceSchema = z.enum(["human", "ai_generated"]);
export type LessonSource = z.infer<typeof LessonSourceSchema>;

export const WordingStyleSchema = z.enum(["official", "shortened"]);
export type WordingStyle = z.infer<typeof WordingStyleSchema>;

export const ModuleStatusSchema = z.enum(["draft", "ai_generated", "published"]);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

const TextContentSchema = z.object({
  body: z.string(),
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

export const LessonSchema = z.discriminatedUnion("type", [
  TextLessonSchema,
  VideoLessonSchema,
  QuizLessonSchema,
  PracticalLessonSchema,
  DiagramLessonSchema,
  FlashcardLessonSchema,
  AccordionLessonSchema,
  MatchingLessonSchema,
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
export type LessonType = Lesson["type"];

export const ModuleSeedSchema = z.object({
  title: z.string(),
  objective: z.string(),
  authorNotes: z.string().optional(),
  rawContent: z.string().optional(),
});

export const ModuleSchema = z.object({
  moduleId: z.string(),
  courseId: z.string(),
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
