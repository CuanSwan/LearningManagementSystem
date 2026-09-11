import type { VideoLesson as VideoLessonType } from "@lms/shared";

export function VideoLesson({ content }: { content: VideoLessonType["content"] }) {
  return (
    <div className="video-lesson">
      <video controls src={content.videoUrl} className="video-lesson-player" />
      {content.transcript && (
        <details className="video-lesson-transcript">
          <summary>Show transcript</summary>
          <p>{content.transcript}</p>
        </details>
      )}
    </div>
  );
}
