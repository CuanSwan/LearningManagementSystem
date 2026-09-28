import { useEffect, useState } from "react";
import { useAuth } from "../auth.js";
import type { ReviewComment, ReviewStatus } from "../types.js";

const STATUS_LABEL: Record<ReviewStatus, string> = {
  changesRequested: "Changes requested",
  changed: "Changed - ready to resubmit",
  needsReview: "Needs review",
};

// Reused for both a single lesson (at the bottom of its content) and a
// whole module (under its title/objective) - a reviewer leaves notes here
// for the admin to act on, and this is also where the admin resubmits once
// they've made the change. Renders nothing at all for a student. See
// server/src/schemas.ts's ReviewStatusSchema for the full workflow.
export function ReviewPanel({
  targetKey,
  reviewStatus,
  fetchComments,
  postComment,
  submitForReview,
  clearReview,
  onReviewStatusChange,
}: {
  // Identifies what this panel is showing comments for (a lessonId, or a
  // fixed string like "module") - the carousel keeps the same
  // StudentLessonBlock instance mounted across Next/Previous (only its
  // `lesson` prop changes), so this drives the refetch directly rather than
  // relying on a remount that never happens.
  targetKey: string;
  reviewStatus: ReviewStatus | undefined;
  fetchComments: () => Promise<ReviewComment[]>;
  postComment: (body: string) => Promise<ReviewComment>;
  submitForReview: () => Promise<unknown>;
  clearReview: () => Promise<unknown>;
  onReviewStatusChange: (reviewStatus: ReviewStatus | undefined) => void;
}) {
  const { user } = useAuth();
  const canSeeReview = user?.role === "admin" || user?.role === "super_admin" || user?.role === "reviewer";
  const isReviewer = user?.role === "reviewer";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const [comments, setComments] = useState<ReviewComment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canSeeReview) return;
    setComments(null);
    setDraft("");
    setError(null);
    let cancelled = false;
    fetchComments()
      .then((list) => !cancelled && setComments(list))
      .catch(() => !cancelled && setComments([]));
    return () => {
      cancelled = true;
    };
    // fetchComments/postComment/etc. are fresh closures every render from
    // the caller - targetKey is what actually identifies a new thing to
    // show, so that (plus canSeeReview) is the real dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSeeReview, targetKey]);

  if (!canSeeReview) return null;

  async function handlePostComment() {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setError(null);
    try {
      const comment = await postComment(body);
      setComments((prev) => [...(prev ?? []), comment]);
      setDraft("");
      onReviewStatusChange("changesRequested");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post that comment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmitForReview() {
    setBusy(true);
    setError(null);
    try {
      await submitForReview();
      onReviewStatusChange("needsReview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit this for review.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    setBusy(true);
    setError(null);
    try {
      await clearReview();
      onReviewStatusChange(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't clear the review flag.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="review-panel">
      <div className="review-panel-header">
        <h4>Reviewer notes</h4>
        {reviewStatus && (
          <span className={`review-panel-status review-panel-status-${reviewStatus}`}>{STATUS_LABEL[reviewStatus]}</span>
        )}
      </div>

      {comments === null ? (
        <p className="review-panel-empty">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="review-panel-empty">No comments yet.</p>
      ) : (
        <ul className="review-panel-comments">
          {comments.map((c) => (
            <li key={c.commentId}>
              <div className="review-panel-comment-meta">
                <strong>{c.authorName}</strong>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="review-panel-error">{error}</p>}

      {isReviewer && (
        <div className="review-panel-compose">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Leave a note for the admin..."
            rows={3}
          />
          <button type="button" onClick={handlePostComment} disabled={busy || !draft.trim()}>
            Post comment
          </button>
        </div>
      )}

      <div className="review-panel-actions">
        {isAdmin && reviewStatus === "changed" && (
          <button type="button" onClick={handleSubmitForReview} disabled={busy}>
            Submit for review
          </button>
        )}
        {(isAdmin || isReviewer) && reviewStatus && (
          <button type="button" className="review-panel-clear-btn" onClick={handleClear} disabled={busy}>
            Clear review flag
          </button>
        )}
      </div>
    </div>
  );
}
