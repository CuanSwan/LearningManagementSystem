import { z } from "zod";

export const LessonSourceSchema = z.enum(["human", "ai_generated"]);
export type LessonSource = z.infer<typeof LessonSourceSchema>;

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

const LessonBaseSchema = z.object({
  lessonId: z.string(),
  schemaVersion: z.number().int().positive(),
  source: LessonSourceSchema,
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

export const LessonSchema = z.discriminatedUnion("type", [
  TextLessonSchema,
  VideoLessonSchema,
  QuizLessonSchema,
  PracticalLessonSchema,
]);

export type Lesson = z.infer<typeof LessonSchema>;
export type TextLesson = z.infer<typeof TextLessonSchema>;
export type VideoLesson = z.infer<typeof VideoLessonSchema>;
export type QuizLesson = z.infer<typeof QuizLessonSchema>;
export type PracticalLesson = z.infer<typeof PracticalLessonSchema>;
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
