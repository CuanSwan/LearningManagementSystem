import { useEffect, useRef } from "react";
import type { VideoLesson as VideoLessonType } from "../types.js";
import { toEmbedUrl } from "../videoEmbed.js";

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
  const firedRef = useRef(false);

  // An embedded player's "ended" event isn't observable from a plain
  // <iframe> without loading that platform's own JS SDK - out of scope
  // here - so, like the other purely-informational lesson types, mark it
  // complete once viewed instead of waiting for a signal we can't get.
  useEffect(() => {
    if (embedUrl && !isComplete && !firedRef.current) {
      firedRef.current = true;
      onComplete();
    }
  }, [embedUrl, isComplete, onComplete]);

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
            if (!isComplete) onComplete();
          }}
        />
      )}
      {content.transcript && (
        <details className="video-lesson-transcript">
          <summary>Show transcript</summary>
          <p>{content.transcript}</p>
        </details>
      )}
    </div>
  );
}
