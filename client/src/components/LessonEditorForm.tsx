import type { AccordionLesson, FlashcardLesson, Lesson, MatchingLesson, PracticalLesson, QuizLesson } from "../types.js";

function QuizEditor({
  content,
  onChange,
}: {
  content: QuizLesson["content"];
  onChange: (content: QuizLesson["content"]) => void;
}) {
  function updateQuestion(qi: number, patch: Partial<QuizLesson["content"]["questions"][number]>) {
    onChange({ questions: content.questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)) });
  }

  function updateOption(qi: number, oi: number, value: string) {
    const q = content.questions[qi];
    updateQuestion(qi, { options: q.options.map((o, i) => (i === oi ? value : o)) });
  }

  function addOption(qi: number) {
    const q = content.questions[qi];
    updateQuestion(qi, { options: [...q.options, ""] });
  }

  function removeOption(qi: number, oi: number) {
    const q = content.questions[qi];
    if (q.options.length <= 2) return;
    const options = q.options.filter((_, i) => i !== oi);
    const correctIndex = q.correctIndex >= options.length ? 0 : q.correctIndex;
    updateQuestion(qi, { options, correctIndex });
  }

  function addQuestion() {
    onChange({ questions: [...content.questions, { prompt: "", options: ["", ""], correctIndex: 0 }] });
  }

  function removeQuestion(qi: number) {
    if (content.questions.length <= 1) return;
    onChange({ questions: content.questions.filter((_, i) => i !== qi) });
  }

  return (
    <div className="field-group">
      {content.questions.map((q, qi) => (
        <fieldset key={qi} className="editor-question">
          <label className="field">
            Prompt
            <input value={q.prompt} onChange={(e) => updateQuestion(qi, { prompt: e.target.value })} />
          </label>
          {q.options.map((opt, oi) => (
            <div key={oi} className="editor-option-row">
              <input
                type="radio"
                title="Correct answer"
                checked={q.correctIndex === oi}
                onChange={() => updateQuestion(qi, { correctIndex: oi })}
              />
              <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} />
              <button type="button" onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2}>
                ×
              </button>
            </div>
          ))}
          <div className="editor-row-actions">
            <button type="button" onClick={() => addOption(qi)}>
              Add option
            </button>
            <button type="button" onClick={() => removeQuestion(qi)} disabled={content.questions.length <= 1}>
              Remove question
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addQuestion}>
        Add question
      </button>
    </div>
  );
}

function PracticalEditor({
  content,
  onChange,
}: {
  content: PracticalLesson["content"];
  onChange: (content: PracticalLesson["content"]) => void;
}) {
  function updateStep(i: number, value: string) {
    onChange({ ...content, steps: content.steps.map((s, idx) => (idx === i ? value : s)) });
  }

  function addStep() {
    onChange({ ...content, steps: [...content.steps, ""] });
  }

  function removeStep(i: number) {
    onChange({ ...content, steps: content.steps.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      <label className="field">
        Instructions
        <textarea
          rows={3}
          value={content.instructions}
          onChange={(e) => onChange({ ...content, instructions: e.target.value })}
        />
      </label>
      {content.steps.map((step, i) => (
        <div key={i} className="editor-option-row">
          <input value={step} onChange={(e) => updateStep(i, e.target.value)} />
          <button type="button" onClick={() => removeStep(i)}>
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={addStep}>
        Add step
      </button>
      <label className="field">
        Submission type
        <select
          value={content.submissionType}
          onChange={(e) =>
            onChange({ ...content, submissionType: e.target.value as PracticalLesson["content"]["submissionType"] })
          }
        >
          <option value="text">Text</option>
          <option value="file">File</option>
          <option value="checklist">Checklist</option>
        </select>
      </label>
    </div>
  );
}

function FlashcardEditor({
  content,
  onChange,
}: {
  content: FlashcardLesson["content"];
  onChange: (content: FlashcardLesson["content"]) => void;
}) {
  function updateCard(i: number, patch: Partial<FlashcardLesson["content"]["cards"][number]>) {
    onChange({ cards: content.cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  }

  function addCard() {
    onChange({ cards: [...content.cards, { front: "", back: "" }] });
  }

  function removeCard(i: number) {
    if (content.cards.length <= 1) return;
    onChange({ cards: content.cards.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      {content.cards.map((card, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Front
            <input value={card.front} onChange={(e) => updateCard(i, { front: e.target.value })} />
          </label>
          <label className="field">
            Back
            <input value={card.back} onChange={(e) => updateCard(i, { back: e.target.value })} />
          </label>
          <div className="editor-row-actions">
            <button type="button" onClick={() => removeCard(i)} disabled={content.cards.length <= 1}>
              Remove card
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addCard}>
        Add card
      </button>
    </div>
  );
}

function AccordionEditor({
  content,
  onChange,
}: {
  content: AccordionLesson["content"];
  onChange: (content: AccordionLesson["content"]) => void;
}) {
  function updateSection(i: number, patch: Partial<AccordionLesson["content"]["sections"][number]>) {
    onChange({ sections: content.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }

  function addSection() {
    onChange({ sections: [...content.sections, { title: "", body: "" }] });
  }

  function removeSection(i: number) {
    if (content.sections.length <= 1) return;
    onChange({ sections: content.sections.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      {content.sections.map((section, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Title
            <input value={section.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
          </label>
          <label className="field">
            Body
            <textarea rows={3} value={section.body} onChange={(e) => updateSection(i, { body: e.target.value })} />
          </label>
          <div className="editor-row-actions">
            <button type="button" onClick={() => removeSection(i)} disabled={content.sections.length <= 1}>
              Remove section
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addSection}>
        Add section
      </button>
    </div>
  );
}

function MatchingEditor({
  content,
  onChange,
}: {
  content: MatchingLesson["content"];
  onChange: (content: MatchingLesson["content"]) => void;
}) {
  function updatePair(i: number, patch: Partial<MatchingLesson["content"]["pairs"][number]>) {
    onChange({ pairs: content.pairs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  }

  function addPair() {
    onChange({ pairs: [...content.pairs, { prompt: "", match: "" }] });
  }

  function removePair(i: number) {
    if (content.pairs.length <= 2) return;
    onChange({ pairs: content.pairs.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      {content.pairs.map((pair, i) => (
        <div key={i} className="editor-option-row">
          <input placeholder="Prompt" value={pair.prompt} onChange={(e) => updatePair(i, { prompt: e.target.value })} />
          <input placeholder="Match" value={pair.match} onChange={(e) => updatePair(i, { match: e.target.value })} />
          <button type="button" onClick={() => removePair(i)} disabled={content.pairs.length <= 2}>
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={addPair}>
        Add pair
      </button>
    </div>
  );
}

export function LessonEditorForm({
  lesson,
  onChange,
}: {
  lesson: Lesson;
  onChange: (content: Lesson["content"]) => void;
}) {
  switch (lesson.type) {
    case "text":
      return (
        <label className="field">
          Body
          <textarea rows={4} value={lesson.content.body} onChange={(e) => onChange({ body: e.target.value })} />
        </label>
      );
    case "video":
      return (
        <div className="field-group">
          <label className="field">
            Video URL
            <input
              value={lesson.content.videoUrl}
              onChange={(e) => onChange({ ...lesson.content, videoUrl: e.target.value })}
            />
          </label>
          <label className="field">
            Transcript
            <textarea
              rows={3}
              value={lesson.content.transcript ?? ""}
              onChange={(e) => onChange({ ...lesson.content, transcript: e.target.value })}
            />
          </label>
        </div>
      );
    case "quiz":
      return <QuizEditor content={lesson.content} onChange={onChange} />;
    case "practical":
      return <PracticalEditor content={lesson.content} onChange={onChange} />;
    case "diagram":
      return (
        <label className="field">
          Image URL
          <input
            value={lesson.content.imageUrl}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
          />
        </label>
      );
    case "flashcard":
      return <FlashcardEditor content={lesson.content} onChange={onChange} />;
    case "accordion":
      return <AccordionEditor content={lesson.content} onChange={onChange} />;
    case "matching":
      return <MatchingEditor content={lesson.content} onChange={onChange} />;
  }
}
