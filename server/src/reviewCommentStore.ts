import type { Database, DocumentStore } from "./db/index.js";
import { ReviewCommentSchema, type ReviewComment } from "./reviewCommentSchema.js";

let reviewComments: DocumentStore<ReviewComment>;

export async function initReviewCommentStore(db: Database): Promise<void> {
  reviewComments = await db.createStore<ReviewComment>("reviewComments", "commentId");
}

export function listCommentsForLesson(lessonId: string): Promise<ReviewComment[]> {
  return reviewComments.list({ lessonId });
}

export async function createReviewComment(input: {
  lessonId: string;
  moduleId: string;
  authorUserId: string;
  authorName: string;
  body: string;
}): Promise<ReviewComment> {
  const comment = ReviewCommentSchema.parse({
    commentId: crypto.randomUUID(),
    createdAt: Date.now(),
    ...input,
  });
  await reviewComments.set(comment.commentId, comment);
  return comment;
}
