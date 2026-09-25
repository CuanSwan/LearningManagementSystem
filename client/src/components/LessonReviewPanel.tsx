import { useEffect, useState } from "react";
import { clearLessonReview, listLessonComments, postLessonComment, submitLessonForReview } from "../api.js";
import { useAuth } from "../auth.js";
import type { Lesson, LessonReviewStatus, ReviewComment } from "../types.js";

const STATUS_LABEL: Record<LessonReviewStatus, string> = {
  changesRequested: "Changes requested",
  changed: "Changed - ready to resubmit",
  needsReview: "Needs review",
};

// Sits at the bottom of every lesson, but renders nothing at all for a
// student - a reviewer leaves notes here for the admin to act on, and this
// is also where the admin resubmits once they've made the change. See
// server/src/schemas.ts's LessonReviewStatusSchema for the full workflow
// this drives.
export function LessonReviewPanel({
  moduleId,
  lesson,
  onReviewStatusChange,
}: {
  moduleId: string;
  lesson: Lesson;
  onReviewStatusChange: (lessonId: string, reviewStatus: LessonReviewStatus | undefined) => void;
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
    let cancelled = false;
    listLessonComments(moduleId, lesson.lessonId)
      .then((list) => !cancelled && setComments(list))
      .catch(() => !cancelled && setComments([]));
    return () => {
      cancelled = true;
    };
  }, [moduleId, lesson.lessonId, canSeeReview]);

  if (!canSeeReview) return null;

  async function handlePostComment() {
    const body = draft.trim();
    if (!body) return;
    setBusy(true);
    setError(null);
    try {
      const comment = await postLessonComment(moduleId, lesson.lessonId, body);
      setComments((prev) => [...(prev ?? []), comment]);
      setDraft("");
      onReviewStatusChange(lesson.lessonId, "changesRequested");
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
      await submitLessonForReview(moduleId, lesson.lessonId);
      onReviewStatusChange(lesson.lessonId, "needsReview");
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
      await clearLessonReview(moduleId, lesson.lessonId);
      onReviewStatusChange(lesson.lessonId, undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't clear the review flag.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lesson-review-panel">
      <div className="lesson-review-header">
        <h4>Reviewer notes</h4>
        {lesson.reviewStatus && (
          <span className={`lesson-review-status lesson-review-status-${lesson.reviewStatus}`}>
            {STATUS_LABEL[lesson.reviewStatus]}
          </span>
        )}
      </div>

      {comments === null ? (
        <p className="lesson-review-empty">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="lesson-review-empty">No comments yet.</p>
      ) : (
        <ul className="lesson-review-comments">
          {comments.map((c) => (
            <li key={c.commentId}>
              <div className="lesson-review-comment-meta">
                <strong>{c.authorName}</strong>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="lesson-review-error">{error}</p>}

      {isReviewer && (
        <div className="lesson-review-compose">
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

      <div className="lesson-review-actions">
        {isAdmin && lesson.reviewStatus === "changed" && (
          <button type="button" onClick={handleSubmitForReview} disabled={busy}>
            Submit for review
          </button>
        )}
        {(isAdmin || isReviewer) && lesson.reviewStatus && (
          <button type="button" className="lesson-review-clear-btn" onClick={handleClear} disabled={busy}>
            Clear review flag
          </button>
        )}
      </div>
    </div>
  );
}
