import { lazy, Suspense } from "react";
import type {
  AccordionLesson,
  CardGridLesson,
  DialLesson,
  ExamBreakdownLesson,
  FlashcardLesson,
  Lesson,
  MatchingLesson,
  PipelineLesson,
  PracticalLesson,
  QuizLesson,
} from "../types.js";

// TipTap/ProseMirror are the single largest dependency in this app's bundle
// - lazy-loaded so students (who never open this editor) never pay for it,
// only admins the moment they actually edit a text lesson.
const RichTextEditor = lazy(() => import("./RichTextEditor.js").then((m) => ({ default: m.RichTextEditor })));

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

const DIAL_MIN_STAGES = 2;
const DIAL_MAX_STAGES = 20;

function DialEditor({
  content,
  onChange,
}: {
  content: DialLesson["content"];
  onChange: (content: DialLesson["content"]) => void;
}) {
  function updateStage(i: number, patch: Partial<DialLesson["content"]["stages"][number]>) {
    onChange({ stages: content.stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }

  function addStage() {
    if (content.stages.length >= DIAL_MAX_STAGES) return;
    onChange({ stages: [...content.stages, { title: "", body: "" }] });
  }

  function removeStage(i: number) {
    if (content.stages.length <= DIAL_MIN_STAGES) return;
    onChange({ stages: content.stages.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      <span className="field-hint">
        The dial shows one circle per stage below - add or remove stages ({DIAL_MIN_STAGES}-{DIAL_MAX_STAGES}) to
        change how many circles it has.
      </span>
      {content.stages.map((stage, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Title
            <input value={stage.title} onChange={(e) => updateStage(i, { title: e.target.value })} />
          </label>
          <label className="field">
            Text
            <textarea rows={3} value={stage.body} onChange={(e) => updateStage(i, { body: e.target.value })} />
          </label>
          <div className="editor-row-actions">
            <button type="button" onClick={() => removeStage(i)} disabled={content.stages.length <= DIAL_MIN_STAGES}>
              Remove stage
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addStage} disabled={content.stages.length >= DIAL_MAX_STAGES}>
        Add stage
      </button>
    </div>
  );
}

const PIPELINE_MIN_STEPS = 2;
const PIPELINE_MAX_STEPS = 7;

function PipelineEditor({
  content,
  onChange,
}: {
  content: PipelineLesson["content"];
  onChange: (content: PipelineLesson["content"]) => void;
}) {
  function updateStep(i: number, patch: Partial<PipelineLesson["content"]["steps"][number]>) {
    onChange({ steps: content.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }

  function addStep() {
    if (content.steps.length >= PIPELINE_MAX_STEPS) return;
    onChange({ steps: [...content.steps, { title: "", body: "" }] });
  }

  function removeStep(i: number) {
    if (content.steps.length <= PIPELINE_MIN_STEPS) return;
    onChange({ steps: content.steps.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      <span className="field-hint">
        The pipeline shows one station per step below - add or remove steps ({PIPELINE_MIN_STEPS}-
        {PIPELINE_MAX_STEPS}) to change how many stations it has.
      </span>
      {content.steps.map((step, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Title
            <input value={step.title} onChange={(e) => updateStep(i, { title: e.target.value })} />
          </label>
          <label className="field">
            Text
            <textarea rows={3} value={step.body} onChange={(e) => updateStep(i, { body: e.target.value })} />
          </label>
          <div className="editor-row-actions">
            <button type="button" onClick={() => removeStep(i)} disabled={content.steps.length <= PIPELINE_MIN_STEPS}>
              Remove step
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addStep} disabled={content.steps.length >= PIPELINE_MAX_STEPS}>
        Add step
      </button>
    </div>
  );
}

const CARD_GRID_MIN_CARDS = 2;

function CardGridEditor({
  content,
  onChange,
}: {
  content: CardGridLesson["content"];
  onChange: (content: CardGridLesson["content"]) => void;
}) {
  function updateCard(i: number, patch: Partial<CardGridLesson["content"]["cards"][number]>) {
    onChange({ cards: content.cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  }

  function addCard() {
    onChange({ cards: [...content.cards, { title: "", useWhen: "", looksLike: "", noteLabel: "", noteBody: "" }] });
  }

  function removeCard(i: number) {
    if (content.cards.length <= CARD_GRID_MIN_CARDS) return;
    onChange({ cards: content.cards.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      <span className="field-hint">
        The grid always lays out 3 cards per row and wraps (centering any leftover row) beyond that - add as many
        cards as you like, at least {CARD_GRID_MIN_CARDS}.
      </span>
      {content.cards.map((card, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Title
            <input value={card.title} onChange={(e) => updateCard(i, { title: e.target.value })} />
          </label>
          <label className="field">
            Use when
            <textarea rows={2} value={card.useWhen} onChange={(e) => updateCard(i, { useWhen: e.target.value })} />
          </label>
          <label className="field">
            Looks like
            <textarea
              rows={2}
              value={card.looksLike}
              onChange={(e) => updateCard(i, { looksLike: e.target.value })}
            />
          </label>
          <label className="field">
            Note label
            <input value={card.noteLabel} onChange={(e) => updateCard(i, { noteLabel: e.target.value })} />
          </label>
          <label className="field">
            Note text
            <textarea rows={2} value={card.noteBody} onChange={(e) => updateCard(i, { noteBody: e.target.value })} />
          </label>
          <div className="editor-row-actions">
            <button type="button" onClick={() => removeCard(i)} disabled={content.cards.length <= CARD_GRID_MIN_CARDS}>
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

function ExamBreakdownEditor({
  content,
  onChange,
}: {
  content: ExamBreakdownLesson["content"];
  onChange: (content: ExamBreakdownLesson["content"]) => void;
}) {
  return (
    <div className="field-group">
      <label className="field">
        Number of questions
        <input
          type="number"
          min={1}
          step={1}
          value={content.questionCount}
          onChange={(e) => onChange({ ...content, questionCount: Number(e.target.value) })}
        />
      </label>
      <label className="field">
        Time limit (minutes)
        <input
          type="number"
          min={1}
          step={1}
          value={content.timeLimitMinutes}
          onChange={(e) => onChange({ ...content, timeLimitMinutes: Number(e.target.value) })}
        />
      </label>
      <label className="field">
        Pass mark (%)
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={content.passMarkPercent}
          onChange={(e) => onChange({ ...content, passMarkPercent: Number(e.target.value) })}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={content.openBook}
          onChange={(e) => onChange({ ...content, openBook: e.target.checked })}
        />
        Open book
      </label>
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
          <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
            <RichTextEditor value={lesson.content.body} onChange={(body) => onChange({ body })} />
          </Suspense>
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
    case "dial":
      return <DialEditor content={lesson.content} onChange={onChange} />;
    case "pipeline":
      return <PipelineEditor content={lesson.content} onChange={onChange} />;
    case "cardGrid":
      return <CardGridEditor content={lesson.content} onChange={onChange} />;
    case "html":
      return (
        <label className="field">
          HTML
          <textarea
            rows={8}
            spellCheck={false}
            value={lesson.content.html}
            onChange={(e) => onChange({ html: e.target.value })}
          />
          <span className="field-hint">Sanitized before display - scripts and event handlers are stripped.</span>
        </label>
      );
    case "embed":
      return (
        <label className="field">
          Embed URL
          <input
            value={lesson.content.url}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://..."
          />
          <span className="field-hint">
            Must be http(s). Some sites block being embedded and won&apos;t load here even with a valid URL.
          </span>
        </label>
      );
    case "examBreakdown":
      return <ExamBreakdownEditor content={lesson.content} onChange={onChange} />;
  }
}
