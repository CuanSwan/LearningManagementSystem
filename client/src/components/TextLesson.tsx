import { useEffect, useRef } from "react";
import type { TextLesson as TextLessonType } from "@lms/shared";

export function TextLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: TextLessonType["content"];
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

  return <p>{content.body}</p>;
}
