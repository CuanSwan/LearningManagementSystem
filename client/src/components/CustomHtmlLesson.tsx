import DOMPurify from "dompurify";
import { useEffect, useRef } from "react";
import type { CustomHtmlLesson as CustomHtmlLessonType } from "../types.js";

export function CustomHtmlLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: CustomHtmlLessonType["content"];
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

  // Sanitized at render time (not just on save) so every rendering path -
  // this one, used by both the admin preview and the student view - is
  // protected the same way regardless of how the HTML got into storage.
  const clean = DOMPurify.sanitize(content.html);

  return <div className="html-lesson" dangerouslySetInnerHTML={{ __html: clean }} />;
}
