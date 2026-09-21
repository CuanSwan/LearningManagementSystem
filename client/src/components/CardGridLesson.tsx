import { useState } from "react";
import type { CardGridLesson as CardGridLessonType } from "../types.js";

export function CardGridLesson({ content, isComplete = false, onComplete = () => {} }: {
  content: CardGridLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(new Set());
  const total = content.cards.length;

  function select(index: number) {
    setSelected(selected === index ? null : index);
    if (seen.has(index)) return;
    const next = new Set(seen).add(index);
    setSeen(next);
    if (!isComplete && next.size === total) onComplete();
  }

  return (
    <div className="cardgrid-lesson">
      {content.cards.map((card, i) => {
        const isSelected = selected === i;
        return (
          <button
            key={i}
            type="button"
            className={`cardgrid-lesson-card${isSelected ? " is-selected" : ""}`}
            aria-expanded={isSelected}
            onClick={() => select(i)}
          >
            <h3 className="cardgrid-lesson-title">{card.title}</h3>
            <div className="cardgrid-lesson-section">
              <span className="cardgrid-lesson-label">Use when</span>
              <p className="cardgrid-lesson-text">{card.useWhen}</p>
            </div>
            {isSelected && (
              <>
                <div className="cardgrid-lesson-section">
                  <span className="cardgrid-lesson-label">Looks like</span>
                  <p className="cardgrid-lesson-text">{card.looksLike}</p>
                </div>
                <div className="cardgrid-lesson-section cardgrid-lesson-note">
                  <span className="cardgrid-lesson-label">{card.noteLabel}</span>
                  <p className="cardgrid-lesson-text">{card.noteBody}</p>
                </div>
              </>
            )}
            {!isSelected && <span className="cardgrid-lesson-hint">Read more →</span>}
          </button>
        );
      })}
    </div>
  );
}
