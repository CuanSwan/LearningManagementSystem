import type { LessonDisplayMode } from "../api.js";

export function DisplayPreferenceChooser({ onChoose }: { onChoose: (mode: LessonDisplayMode) => void }) {
  return (
    <div className="preference-chooser">
      <div className="preference-chooser-card">
        <h1>How do you want to read lessons?</h1>
        <p>You can change this anytime from the top bar.</p>
        <div className="preference-options">
          <button type="button" className="preference-option" onClick={() => onChoose("vertical")}>
            <strong>List</strong>
            <span>Scroll through every lesson on one page</span>
          </button>
          <button type="button" className="preference-option" onClick={() => onChoose("carousel")}>
            <strong>Carousel</strong>
            <span>Step through one lesson at a time</span>
          </button>
        </div>
      </div>
    </div>
  );
}
