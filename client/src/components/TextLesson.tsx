import DOMPurify from "dompurify";
import { useEffect, useRef } from "react";
import type { TextLesson as TextLessonType } from "../types.js";

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

  // Sanitized at render time (not just on save) so every rendering path is
  // protected the same way regardless of how the markup got into storage -
  // same reasoning as CustomHtmlLesson. Old plain-text bodies (no markup)
  // pass through DOMPurify unchanged and still render fine.
  const clean = DOMPurify.sanitize(content.body);

  return <div className="text-lesson-body" dangerouslySetInnerHTML={{ __html: clean }} />;
}
