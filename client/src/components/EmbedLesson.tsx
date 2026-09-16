import type { EmbedLesson as EmbedLessonType } from "../types.js";

export function EmbedLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: EmbedLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className="embed-lesson">
      <iframe
        src={content.url}
        className="embed-lesson-frame"
        // Cross-origin content in its own browsing context can't touch this
        // app's cookies or DOM. allow-scripts+allow-same-origin together is
        // the standard, safe combination for framing a genuinely different
        // origin (it only becomes risky if the framed page were same-origin
        // with us, which an external practical site never is); top-level
        // navigation is deliberately not allowed, so the embedded page can't
        // redirect the whole app.
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        referrerPolicy="no-referrer"
        loading="lazy"
        title="Embedded practical exercise"
      />
      {!isComplete && (
        <button type="button" className="embed-lesson-complete-btn" onClick={onComplete}>
          Mark practical as complete
        </button>
      )}
    </div>
  );
}
