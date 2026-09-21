import type { Lesson } from "../types.js";
import { AccordionLesson } from "./AccordionLesson.js";
import { CardGridLesson } from "./CardGridLesson.js";
import { CustomHtmlLesson } from "./CustomHtmlLesson.js";
import { DiagramLesson } from "./DiagramLesson.js";
import { DialLesson } from "./DialLesson.js";
import { EmbedLesson } from "./EmbedLesson.js";
import { ExamBreakdownLesson } from "./ExamBreakdownLesson.js";
import { FlashcardLesson } from "./FlashcardLesson.js";
import { HotspotsLesson } from "./HotspotsLesson.js";
import { MatchingLesson } from "./MatchingLesson.js";
import { PipelineLesson } from "./PipelineLesson.js";
import { PracticalLesson } from "./PracticalLesson.js";
import { PresentationDialLesson } from "./PresentationDialLesson.js";
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
    case "diagram":
      return <DiagramLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "flashcard":
      return <FlashcardLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "accordion":
      return <AccordionLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "matching":
      return <MatchingLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "dial":
      return <DialLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "pipeline":
      return <PipelineLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "presentationDial":
      return <PresentationDialLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "cardGrid":
      return <CardGridLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "hotspots":
      return <HotspotsLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "html":
      return <CustomHtmlLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "embed":
      return <EmbedLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
    case "examBreakdown":
      return <ExamBreakdownLesson content={lesson.content} isComplete={isComplete} onComplete={onComplete} />;
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
