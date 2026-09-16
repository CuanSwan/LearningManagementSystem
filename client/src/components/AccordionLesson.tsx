import { useState } from "react";
import type { AccordionLesson as AccordionLessonType } from "../types.js";

export function AccordionLesson({
  content,
  isComplete = false,
  onComplete = () => {},
}: {
  content: AccordionLessonType["content"];
  isComplete?: boolean;
  onComplete?: () => void;
}) {
  const [opened, setOpened] = useState<Record<number, boolean>>({});

  function toggle(sectionIndex: number) {
    const next = { ...opened, [sectionIndex]: !opened[sectionIndex] };
    setOpened(next);
    const allOpened = content.sections.every((_, i) => next[i]);
    if (!isComplete && allOpened) onComplete();
  }

  return (
    <div className="accordion-lesson">
      {content.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="accordion-section">
          <button
            type="button"
            className="accordion-section-title"
            aria-expanded={opened[sectionIndex] ?? false}
            onClick={() => toggle(sectionIndex)}
          >
            {section.title}
          </button>
          {opened[sectionIndex] && <p className="accordion-section-body">{section.body}</p>}
        </div>
      ))}
    </div>
  );
}
