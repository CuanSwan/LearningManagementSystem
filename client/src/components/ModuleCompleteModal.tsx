import { useNavigate } from "react-router-dom";
import type { Module } from "../types.js";

export function ModuleCompleteModal({
  moduleTitle,
  nextModule,
  courseId,
  onClose,
}: {
  moduleTitle: string;
  nextModule: Module | null;
  courseId: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="module-complete-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="module-complete-title">Module complete!</h2>
        <p>
          You&apos;ve finished every lesson in <strong>{moduleTitle}</strong>.
        </p>
        {nextModule ? (
          <p>Ready to keep going with &ldquo;{nextModule.seed.title}&rdquo;?</p>
        ) : (
          <p>That was the last module in this course - nice work.</p>
        )}
        <div className="modal-actions">
          <button type="button" className="modal-secondary" onClick={onClose}>
            Stay here
          </button>
          {nextModule ? (
            <button
              type="button"
              className="modal-primary"
              onClick={() => navigate(`/courses/${courseId}/modules/${nextModule.moduleId}`)}
            >
              Next module &rarr;
            </button>
          ) : (
            <button type="button" className="modal-primary" onClick={() => navigate(`/courses/${courseId}`)}>
              Back to course overview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
