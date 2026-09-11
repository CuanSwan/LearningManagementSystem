import type { VideoLesson as VideoLessonType } from "@lms/shared";

export function VideoLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: VideoLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div className="video-lesson">
      <video
        controls
        src={content.videoUrl}
        className="video-lesson-player"
        onEnded={() => {
          if (!isComplete) onComplete();
        }}
      />
      {content.transcript && (
        <details className="video-lesson-transcript">
          <summary>Show transcript</summary>
          <p>{content.transcript}</p>
        </details>
      )}
    </div>
  );
}
