import { useEffect, useRef } from "react";
import type { CustomHtmlLesson as CustomHtmlLessonType } from "../types.js";
import { RichTextView } from "./RichTextView.js";

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

  return <RichTextView className="html-lesson" html={content.html} />;
}
