import type { VideoLesson as VideoLessonType } from "@lms/shared";

export function VideoLesson({ content }: { content: VideoLessonType["content"] }) {
  return (
    <div>
      <video controls src={content.videoUrl} style={{ maxWidth: "100%" }} />
      {content.transcript && <details>
        <summary>Transcript</summary>
        <p>{content.transcript}</p>
      </details>}
    </div>
  );
}
