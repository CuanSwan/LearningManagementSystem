import { z } from "zod";

// A client-local copy of the lesson validation used only for immediate
// feedback when importing JSON into the component library (see
// ComponentLibrary.tsx). The server independently re-validates everything
// it's actually asked to store - this is just so a bad paste gets a fast,
// specific error instead of a round trip.

const LessonSourceSchema = z.enum(["human", "ai_generated"]);
const WordingStyleSchema = z.enum(["official", "shortened"]);

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

export const LessonSchema = z.discriminatedUnion("type", [
  LessonBaseSchema.extend({ type: z.literal("text"), content: TextContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("video"), content: VideoContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("quiz"), content: QuizContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("practical"), content: PracticalContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("diagram"), content: DiagramContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("flashcard"), content: FlashcardContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("accordion"), content: AccordionContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("matching"), content: MatchingContentSchema }),
]);
