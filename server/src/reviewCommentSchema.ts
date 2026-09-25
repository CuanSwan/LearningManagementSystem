import { z } from "zod";

// A reviewer's note on a specific lesson - visible to admin/super_admin/
// reviewer only, never a student (see index.ts's route guards). Purely a
// running log: there's no per-comment resolved flag, since the lesson's
// own reviewStatus (see schemas.ts) is what actually drives the workflow -
// these are the reasoning behind it, not state themselves.
export const ReviewCommentSchema = z.object({
  commentId: z.string(),
  lessonId: z.string(),
  moduleId: z.string(),
  authorUserId: z.string(),
  authorName: z.string(),
  body: z.string().min(1),
  createdAt: z.number(),
});
export type ReviewComment = z.infer<typeof ReviewCommentSchema>;
