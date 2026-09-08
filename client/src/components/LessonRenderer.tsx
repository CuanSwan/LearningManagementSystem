import type { Lesson } from "@lms/shared";
import { PracticalLesson } from "./PracticalLesson.js";
import { QuizLesson } from "./QuizLesson.js";
import { TextLesson } from "./TextLesson.js";
import { VideoLesson } from "./VideoLesson.js";

function renderContent(lesson: Lesson) {
  switch (lesson.type) {
    case "text":
      return <TextLesson content={lesson.content} />;
    case "video":
      return <VideoLesson content={lesson.content} />;
    case "quiz":
      return <QuizLesson content={lesson.content} />;
    case "practical":
      return <PracticalLesson content={lesson.content} />;
  }
}

export function LessonRenderer({ lesson }: { lesson: Lesson }) {
  return (
    <div
      className="lms-block"
      data-block-id={lesson.lessonId}
      data-block-type={lesson.type}
      data-order={lesson.order}
    >
      {renderContent(lesson)}
    </div>
  );
}
