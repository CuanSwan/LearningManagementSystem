import { lazy, Suspense, useState } from "react";
import { uploadImage } from "../api.js";
import { resolveAssetUrl } from "../assetUrl.js";
import type {
  AccordionLesson,
  CardGridLesson,
  DialLesson,
  DiagramLesson,
  ExamBreakdownLesson,
  FlashcardLesson,
  HotspotsLesson,
  Lesson,
  MatchingLesson,
  PipelineLesson,
  PracticalLesson,
  PresentationDialLesson,
  PromptSimulationLesson,
  QuizLesson,
  TreeScrubLesson,
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
      <div className="field">
        Instructions
        <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
          <RichTextEditor value={content.instructions} onChange={(instructions) => onChange({ ...content, instructions })} />
        </Suspense>
      </div>
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

function DiagramEditor({
  content,
  onChange,
}: {
  content: DiagramLesson["content"];
  onChange: (content: DiagramLesson["content"]) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);
    try {
      const { url } = await uploadImage(file);
      onChange({ imageUrl: url });
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="field-group">
      <label className="field">
        Image URL
        <input value={content.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} />
      </label>
      <label className="field">
        Or upload an image
        <input
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          disabled={status === "uploading"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      </label>
      {status === "uploading" && <p>Uploading...</p>}
      {status === "error" && error && <p className="import-error">{error}</p>}
      {content.imageUrl && <img src={resolveAssetUrl(content.imageUrl)} alt="" className="diagram-editor-preview" />}
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
          <div className="field">
            Body
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={section.body} onChange={(body) => updateSection(i, { body })} />
            </Suspense>
          </div>
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
          <div className="field">
            Text
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={stage.body} onChange={(body) => updateStage(i, { body })} />
            </Suspense>
          </div>
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
          <div className="field">
            Text
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={step.body} onChange={(body) => updateStep(i, { body })} />
            </Suspense>
          </div>
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

const PRESENTATION_DIAL_MIN_STAGES = 2;
const PRESENTATION_DIAL_MAX_STAGES = 20;

function PresentationDialEditor({
  content,
  onChange,
}: {
  content: PresentationDialLesson["content"];
  onChange: (content: PresentationDialLesson["content"]) => void;
}) {
  function updateStage(i: number, patch: Partial<PresentationDialLesson["content"]["stages"][number]>) {
    onChange({ stages: content.stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }

  function addStage() {
    if (content.stages.length >= PRESENTATION_DIAL_MAX_STAGES) return;
    onChange({ stages: [...content.stages, { title: "", body: "" }] });
  }

  function removeStage(i: number) {
    if (content.stages.length <= PRESENTATION_DIAL_MIN_STAGES) return;
    onChange({ stages: content.stages.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      <span className="field-hint">
        Only the 4 most recent stages ever show at once, ending with the current one on the right - add or remove
        stages ({PRESENTATION_DIAL_MIN_STAGES}-{PRESENTATION_DIAL_MAX_STAGES}) to change how many there are to step
        through.
      </span>
      {content.stages.map((stage, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Title
            <input value={stage.title} onChange={(e) => updateStage(i, { title: e.target.value })} />
          </label>
          <div className="field">
            Text
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={stage.body} onChange={(body) => updateStage(i, { body })} />
            </Suspense>
          </div>
          <div className="editor-row-actions">
            <button
              type="button"
              onClick={() => removeStage(i)}
              disabled={content.stages.length <= PRESENTATION_DIAL_MIN_STAGES}
            >
              Remove stage
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addStage} disabled={content.stages.length >= PRESENTATION_DIAL_MAX_STAGES}>
        Add stage
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
          <div className="field">
            Use when
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={card.useWhen} onChange={(useWhen) => updateCard(i, { useWhen })} />
            </Suspense>
          </div>
          <div className="field">
            Looks like
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={card.looksLike} onChange={(looksLike) => updateCard(i, { looksLike })} />
            </Suspense>
          </div>
          <label className="field">
            Note label
            <input value={card.noteLabel} onChange={(e) => updateCard(i, { noteLabel: e.target.value })} />
          </label>
          <div className="field">
            Note text
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={card.noteBody} onChange={(noteBody) => updateCard(i, { noteBody })} />
            </Suspense>
          </div>
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

const HOTSPOTS_MIN_TILES = 2;

function HotspotsEditor({
  content,
  onChange,
}: {
  content: HotspotsLesson["content"];
  onChange: (content: HotspotsLesson["content"]) => void;
}) {
  function updateTile(i: number, patch: Partial<HotspotsLesson["content"]["tiles"][number]>) {
    onChange({ tiles: content.tiles.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  }

  function addTile() {
    onChange({ tiles: [...content.tiles, { title: "", body: "", example: "" }] });
  }

  function removeTile(i: number) {
    if (content.tiles.length <= HOTSPOTS_MIN_TILES) return;
    onChange({ tiles: content.tiles.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      <span className="field-hint">
        The grid always lays out 5 tiles per row and wraps (centering any leftover row) beyond that - add as many
        tiles as you like, at least {HOTSPOTS_MIN_TILES}.
      </span>
      {content.tiles.map((tile, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Title
            <input value={tile.title} onChange={(e) => updateTile(i, { title: e.target.value })} />
          </label>
          <div className="field">
            Note
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={tile.body} onChange={(body) => updateTile(i, { body })} />
            </Suspense>
          </div>
          <div className="field">
            Example
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor value={tile.example} onChange={(example) => updateTile(i, { example })} />
            </Suspense>
          </div>
          <div className="editor-row-actions">
            <button type="button" onClick={() => removeTile(i)} disabled={content.tiles.length <= HOTSPOTS_MIN_TILES}>
              Remove tile
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addTile}>
        Add tile
      </button>
    </div>
  );
}

const TREE_SCRUB_MIN_NODES = 2;
const TREE_SCRUB_MAX_NODES = 20;

function TreeScrubEditor({
  content,
  onChange,
}: {
  content: TreeScrubLesson["content"];
  onChange: (content: TreeScrubLesson["content"]) => void;
}) {
  function updateNode(i: number, patch: Partial<TreeScrubLesson["content"]["nodes"][number]>) {
    onChange({ nodes: content.nodes.map((n, idx) => (idx === i ? { ...n, ...patch } : n)) });
  }

  function addNode() {
    if (content.nodes.length >= TREE_SCRUB_MAX_NODES) return;
    // Defaults to a child of the root - always a valid parentIndex for
    // any position the new node lands in.
    onChange({ nodes: [...content.nodes, { title: "", body: "", parentIndex: 0 }] });
  }

  function removeNode(i: number) {
    if (i === 0) return; // the root is permanent
    if (content.nodes.length <= TREE_SCRUB_MIN_NODES) return;
    const hasChildren = content.nodes.some((n, idx) => idx !== i && n.parentIndex === i);
    if (hasChildren) return;
    // Nothing points at i (checked above), so every other parentIndex is
    // either already below i (untouched) or above it and needs to shift
    // down by one to stay correct once the array closes the gap.
    const nodes = content.nodes
      .filter((_, idx) => idx !== i)
      .map((n) => ({ ...n, parentIndex: n.parentIndex > i ? n.parentIndex - 1 : n.parentIndex }));
    onChange({ nodes });
  }

  function nodeLabel(i: number): string {
    return content.nodes[i]?.title || `Node ${i + 1}`;
  }

  return (
    <div className="field-group">
      <span className="field-hint">
        The first entry is always the root. Every other entry picks a parent from the entries above it - add several
        with the same parent to branch the tree. Add or remove entries ({TREE_SCRUB_MIN_NODES}-{TREE_SCRUB_MAX_NODES}
        ) to change how many there are.
      </span>
      {content.nodes.map((node, i) => {
        const hasChildren = content.nodes.some((n, idx) => idx !== i && n.parentIndex === i);
        return (
          <fieldset key={i} className="editor-question">
            <label className="field">
              Title
              <input value={node.title} onChange={(e) => updateNode(i, { title: e.target.value })} />
            </label>
            <div className="field">
              Text
              <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
                <RichTextEditor value={node.body} onChange={(body) => updateNode(i, { body })} />
              </Suspense>
            </div>
            {i === 0 ? (
              <span className="field-hint">Root - every other entry traces back to this one.</span>
            ) : (
              <label className="field">
                Parent
                <select
                  value={node.parentIndex}
                  onChange={(e) => updateNode(i, { parentIndex: Number(e.target.value) })}
                >
                  {Array.from({ length: i }, (_, parentIdx) => (
                    <option key={parentIdx} value={parentIdx}>
                      {nodeLabel(parentIdx)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="editor-row-actions">
              <button
                type="button"
                onClick={() => removeNode(i)}
                disabled={i === 0 || content.nodes.length <= TREE_SCRUB_MIN_NODES || hasChildren}
                title={hasChildren ? "Remove or reassign this entry's children first" : undefined}
              >
                Remove entry
              </button>
            </div>
          </fieldset>
        );
      })}
      <button type="button" onClick={addNode} disabled={content.nodes.length >= TREE_SCRUB_MAX_NODES}>
        Add entry
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

const PROMPT_SIMULATION_MAX_PRESETS = 8;
const PROMPT_SIMULATION_MAX_QUICK_REPLIES = 6;

function PromptSimulationEditor({
  content,
  onChange,
}: {
  content: PromptSimulationLesson["content"];
  onChange: (content: PromptSimulationLesson["content"]) => void;
}) {
  function updatePreset(i: number, patch: Partial<PromptSimulationLesson["content"]["presets"][number]>) {
    onChange({ ...content, presets: content.presets.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  }

  function addPreset() {
    if (content.presets.length >= PROMPT_SIMULATION_MAX_PRESETS) return;
    onChange({ ...content, presets: [...content.presets, { label: "", note: "", systemPrompt: "" }] });
  }

  function removePreset(i: number) {
    if (content.presets.length <= 1) return;
    onChange({ ...content, presets: content.presets.filter((_, idx) => idx !== i) });
  }

  function updateQuickReply(i: number, value: string) {
    onChange({ ...content, quickReplies: content.quickReplies.map((q, idx) => (idx === i ? value : q)) });
  }

  function addQuickReply() {
    if (content.quickReplies.length >= PROMPT_SIMULATION_MAX_QUICK_REPLIES) return;
    onChange({ ...content, quickReplies: [...content.quickReplies, ""] });
  }

  function removeQuickReply(i: number) {
    onChange({ ...content, quickReplies: content.quickReplies.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="field-group">
      <span className="field-hint">
        Runs a live chat against a real AI model, using whichever system prompt the student currently has loaded -
        each message sent costs real money.
      </span>
      <label className="field">
        Bot name
        <input value={content.botName} onChange={(e) => onChange({ ...content, botName: e.target.value })} />
      </label>
      <label className="field">
        Bot avatar (emoji, optional)
        <input
          value={content.botAvatar ?? ""}
          onChange={(e) => onChange({ ...content, botAvatar: e.target.value })}
          maxLength={8}
        />
      </label>
      <div className="field">
        Intro text
        <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
          <RichTextEditor value={content.lede} onChange={(lede) => onChange({ ...content, lede })} />
        </Suspense>
      </div>

      <span className="field-hint">
        Presets ({content.presets.length}/{PROMPT_SIMULATION_MAX_PRESETS}) - each is a different system prompt the
        student can load with one click, to compare how it changes the bot's behavior.
      </span>
      {content.presets.map((preset, i) => (
        <fieldset key={i} className="editor-question">
          <label className="field">
            Label
            <input value={preset.label} onChange={(e) => updatePreset(i, { label: e.target.value })} />
          </label>
          <label className="field">
            Note (optional)
            <input value={preset.note ?? ""} onChange={(e) => updatePreset(i, { note: e.target.value })} />
          </label>
          <label className="field">
            System prompt
            <textarea
              rows={6}
              spellCheck={false}
              value={preset.systemPrompt}
              onChange={(e) => updatePreset(i, { systemPrompt: e.target.value })}
            />
          </label>
          <div className="editor-row-actions">
            <button type="button" onClick={() => removePreset(i)} disabled={content.presets.length <= 1}>
              Remove preset
            </button>
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={addPreset} disabled={content.presets.length >= PROMPT_SIMULATION_MAX_PRESETS}>
        Add preset
      </button>

      <span className="field-hint">
        Quick-reply chips ({content.quickReplies.length}/{PROMPT_SIMULATION_MAX_QUICK_REPLIES}) - suggested customer
        questions shown above the message box.
      </span>
      {content.quickReplies.map((reply, i) => (
        <div key={i} className="editor-row-actions">
          <input value={reply} onChange={(e) => updateQuickReply(i, e.target.value)} />
          <button type="button" onClick={() => removeQuickReply(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addQuickReply} disabled={content.quickReplies.length >= PROMPT_SIMULATION_MAX_QUICK_REPLIES}>
        Add quick reply
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
        // A plain div, not a <label> - the editor below has many of its own form
        // controls (the toolbar's selects/buttons), and wrapping them all in one
        // unassociated label makes the browser forward every click inside the
        // editor to the first labelable descendant, stealing focus/selection
        // away from the contenteditable itself.
        <div className="field">
          Body
          <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
            <RichTextEditor value={lesson.content.body} onChange={(body) => onChange({ body })} />
          </Suspense>
        </div>
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
          <div className="field">
            Transcript
            <Suspense fallback={<p className="field-hint">Loading editor...</p>}>
              <RichTextEditor
                value={lesson.content.transcript ?? ""}
                onChange={(transcript) => onChange({ ...lesson.content, transcript })}
              />
            </Suspense>
          </div>
        </div>
      );
    case "quiz":
      return <QuizEditor content={lesson.content} onChange={onChange} />;
    case "practical":
      return <PracticalEditor content={lesson.content} onChange={onChange} />;
    case "diagram":
      return <DiagramEditor content={lesson.content} onChange={onChange} />;
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
    case "presentationDial":
      return <PresentationDialEditor content={lesson.content} onChange={onChange} />;
    case "cardGrid":
      return <CardGridEditor content={lesson.content} onChange={onChange} />;
    case "hotspots":
      return <HotspotsEditor content={lesson.content} onChange={onChange} />;
    case "treeScrub":
      return <TreeScrubEditor content={lesson.content} onChange={onChange} />;
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
    case "promptSimulation":
      return <PromptSimulationEditor content={lesson.content} onChange={onChange} />;
  }
}
