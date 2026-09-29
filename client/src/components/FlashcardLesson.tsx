import { useRef, useState } from "react";
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
  // Completion means "has seen every card's back at least once," which
  // needs to stay true even if a card is later flipped back to its front -
  // tracked separately from `flipped` (the currently-displayed face, which
  // toggles freely) so flipping one back doesn't undo completion.
  const seenBackRef = useRef<Set<number>>(new Set());

  function toggleFlip(cardIndex: number) {
    const showingBack = !flipped[cardIndex];
    setFlipped((prev) => ({ ...prev, [cardIndex]: showingBack }));
    if (!showingBack) return;
    seenBackRef.current.add(cardIndex);
    if (!isComplete && seenBackRef.current.size === content.cards.length) onComplete();
  }

  return (
    <div className="flashcard-lesson">
      {content.cards.map((card, cardIndex) => (
        <button
          key={cardIndex}
          type="button"
          className={`flashcard${flipped[cardIndex] ? " is-flipped" : ""}`}
          onClick={() => toggleFlip(cardIndex)}
        >
          <span className="flashcard-face">{flipped[cardIndex] ? card.back : card.front}</span>
        </button>
      ))}
    </div>
  );
}
