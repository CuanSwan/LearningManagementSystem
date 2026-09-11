import { useEffect, useRef } from "react";
import type { DiagramLesson as DiagramLessonType } from "@lms/shared";

export function DiagramLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: DiagramLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!isComplete && !firedRef.current) {
      firedRef.current = true;
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="diagram-lesson">
      <img src={content.imageUrl} alt="" className="diagram-lesson-image" />
    </div>
  );
}
