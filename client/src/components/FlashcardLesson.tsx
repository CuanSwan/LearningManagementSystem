import { useState } from "react";
import type { FlashcardLesson as FlashcardLessonType } from "../types.js";

export function FlashcardLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: FlashcardLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  function flip(cardIndex: number) {
    const next = { ...flipped, [cardIndex]: true };
    setFlipped(next);
    const allFlipped = content.cards.every((_, i) => next[i]);
    if (!isComplete && allFlipped) onComplete();
  }

  return (
    <div className="flashcard-lesson">
      {content.cards.map((card, cardIndex) => (
        <button
          key={cardIndex}
          type="button"
          className={`flashcard${flipped[cardIndex] ? " is-flipped" : ""}`}
          onClick={() => flip(cardIndex)}
        >
          <span className="flashcard-face">{flipped[cardIndex] ? card.back : card.front}</span>
        </button>
      ))}
    </div>
  );
}
