import { useEffect, useRef } from "react";
import type { ExamBreakdownLesson as ExamBreakdownLessonType } from "../types.js";

export function ExamBreakdownLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: ExamBreakdownLessonType["content"];
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
    <dl className="exam-breakdown-lesson">
      <div className="exam-breakdown-stat">
        <dt>Questions</dt>
        <dd>{content.questionCount}</dd>
      </div>
      <div className="exam-breakdown-stat">
        <dt>Time limit</dt>
        <dd>{content.timeLimitMinutes} min</dd>
      </div>
      <div className="exam-breakdown-stat">
        <dt>Pass mark</dt>
        <dd>{content.passMarkPercent}%</dd>
      </div>
      <div className="exam-breakdown-stat">
        <dt>Format</dt>
        <dd>{content.openBook ? "Open book" : "Closed book"}</dd>
      </div>
    </dl>
  );
}
