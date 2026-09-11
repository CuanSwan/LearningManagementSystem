import type { Lesson } from "@lms/shared";
import { PracticalLesson } from "./PracticalLesson.js";
import { QuizLesson } from "./QuizLesson.js";
import { TextLesson } from "./TextLesson.js";
import { VideoLesson } from "./VideoLesson.js";

function renderContent(lesson: Lesson, isComplete: boolean, onComplete: () => void) {
  switch (lesson.type) {
    case "text":
      return <TextLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "video":
      return <VideoLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "quiz":
      return <QuizLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "practical":
      return <PracticalLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
  }
}

export function LessonRenderer({
  lesson,
  isComplete = false,
  onComplete = () => {},
}: {
  lesson: Lesson;
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  return (
    <div
      className="lms-block"
      data-block-id={lesson.lessonId}
      data-block-type={lesson.type}
      data-wording-style={lesson.wordingStyle}
      data-order={lesson.order}
    >
      {renderContent(lesson, isComplete, onComplete)}
    </div>
  );
}
