import { useEffect, useRef, useState } from "react";
import type { VideoLesson as VideoLessonType } from "../types.js";
import { toEmbedUrl } from "../videoEmbed.js";
import { RichTextView } from "./RichTextView.js";

export function VideoLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: VideoLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const embedUrl = content.videoUrl ? toEmbedUrl(content.videoUrl) : null;
  // A direct file URL (not a recognized embeddable platform) can still
  // fail to load at runtime - wrong URL, deleted asset, wrong MIME type -
  // which the native <video> element's own error event is the reliable
  // way to detect (a manual fetch/HEAD check would itself get blocked by
  // CORS for most cross-origin video hosts, and wouldn't catch every way
  // playback can fail anyway). A missing URL is broken from the start,
  // with no load attempt needed to know that.
  const [broken, setBroken] = useState(!content.videoUrl && !embedUrl);
  const firedRef = useRef(false);

  // Completion is never gated on proving playback actually happened - an
  // embedded iframe's "ended" event isn't observable at all (see below),
  // and a broken or missing link can never fire one either. Marks complete
  // as soon as there's something to show (a working embed) or definitively
  // nothing to show (broken/missing) - a still-loading native <video> is
  // the one case left to wait on, via its own onEnded below.
  useEffect(() => {
    if (!isComplete && !firedRef.current && (embedUrl || broken)) {
      firedRef.current = true;
      onComplete();
    }
  }, [embedUrl, broken, isComplete, onComplete]);

  if (broken) {
    return (
      <div className="video-lesson">
        <div className="video-lesson-embed video-lesson-fallback">
          <p>{content.videoUrl ? "This video couldn't be loaded." : "No video has been added to this lesson yet."}</p>
        </div>
        {content.transcript && (
          <details className="video-lesson-transcript">
            <summary>Show transcript</summary>
            <RichTextView className="video-lesson-transcript-body" html={content.transcript} />
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="video-lesson">
      {embedUrl ? (
        <div className="video-lesson-embed">
          <iframe
            src={embedUrl}
            className="video-lesson-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video lesson"
          />
        </div>
      ) : (
        <video
          controls
          src={content.videoUrl}
          className="video-lesson-player"
          onPlay={(e) => {
            const el = e.currentTarget;
            if (document.fullscreenElement !== el) {
              el.requestFullscreen?.().catch(() => {});
            }
          }}
          onEnded={() => {
            // Same firedRef guard as the embed/broken branch above - isComplete
            // is server-derived and only flips true after onComplete's
            // markComplete() round-trips to the API, so relying on it alone
            // leaves a window (replaying, seeking back to the end, or just a
            // slow network) where "ended" firing again sends a second
            // duplicate PUT /api/progress/lessons/:lessonId.
            if (!isComplete && !firedRef.current) {
              firedRef.current = true;
              onComplete();
            }
          }}
          onError={() => setBroken(true)}
        />
      )}
      {content.transcript && (
        <details className="video-lesson-transcript">
          <summary>Show transcript</summary>
          <RichTextView className="video-lesson-transcript-body" html={content.transcript} />
        </details>
      )}
    </div>
  );
}
