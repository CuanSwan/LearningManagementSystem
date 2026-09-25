import type { Database, DocumentStore } from "./db/index.js";
import { ReviewCommentSchema, type ReviewComment } from "./reviewCommentSchema.js";

let reviewComments: DocumentStore<ReviewComment>;

export async function initReviewCommentStore(db: Database): Promise<void> {
  reviewComments = await db.createStore<ReviewComment>("reviewComments", "commentId");
}

export function listCommentsForLesson(lessonId: string): Promise<ReviewComment[]> {
  return reviewComments.list({ lessonId });
}

// A module-level comment is a ReviewComment with no lessonId. Filtering
// this in JS after list({ moduleId }), rather than passing lessonId:
// undefined into the store's own filter, since a store's Partial<T> match
// isn't guaranteed to mean "field absent" for an explicitly-undefined value.
export async function listCommentsForModule(moduleId: string): Promise<ReviewComment[]> {
  const all = await reviewComments.list({ moduleId });
  return all.filter((c) => !c.lessonId);
}

export async function createReviewComment(input: {
  lessonId?: string;
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
