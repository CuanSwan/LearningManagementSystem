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

const DialContentSchema = z.object({
  stages: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(20),
});

const PipelineContentSchema = z.object({
  steps: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(7),
});

const PresentationDialContentSchema = z.object({
  stages: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(20),
});

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

const HotspotsContentSchema = z.object({
  tiles: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        example: z.string(),
      })
    )
    .min(2),
});

const TreeScrubContentSchema = z.object({
  nodes: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        parentIndex: z.number().int().nonnegative(),
      })
    )
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
  html: z.string(),
});

const EmbedContentSchema = z.object({
  // Empty is allowed - it's the blank-lesson factory's starting state (see
  // schemas.ts's EmbedContentSchema on the server, which this mirrors).
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

const PromptSimulationPresetSchema = z.object({
  label: z.string().max(80),
  note: z.string().max(160).optional(),
  systemPrompt: z.string().max(4000),
});

const PromptSimulationContentSchema = z.object({
  botName: z.string().max(80),
  botAvatar: z.string().max(8).optional(),
  lede: z.string(),
  presets: z.array(PromptSimulationPresetSchema).min(1).max(8),
  quickReplies: z.array(z.string().max(200)).max(6).default([]),
});

const LessonBaseSchema = z.object({
  lessonId: z.string(),
  schemaVersion: z.number().int().positive(),
  source: LessonSourceSchema,
  wordingStyle: WordingStyleSchema,
  order: z.number().int().nonnegative(),
  title: z.string().default("Untitled lesson"),
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
  LessonBaseSchema.extend({ type: z.literal("dial"), content: DialContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("pipeline"), content: PipelineContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("presentationDial"), content: PresentationDialContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("cardGrid"), content: CardGridContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("hotspots"), content: HotspotsContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("treeScrub"), content: TreeScrubContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("html"), content: CustomHtmlContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("embed"), content: EmbedContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("examBreakdown"), content: ExamBreakdownContentSchema }),
  LessonBaseSchema.extend({ type: z.literal("promptSimulation"), content: PromptSimulationContentSchema }),
]);
