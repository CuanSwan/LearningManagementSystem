import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { submitBugReport } from "../api.js";
import { useAuth } from "../auth.js";

export function ReportBug() {
  const { user } = useAuth();
  const location = useLocation();
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // The page the bug happened on, captured automatically rather than
  // asking the reporter to type it out. document.referrer wouldn't work
  // for this in a single-page app - it only reflects the original full
  // page load, never a client-side route change - so this is threaded
  // through as router state from wherever the "Report a bug" link was
  // clicked (see AccessibilityMenu.tsx) instead.
  const fromPath = (location.state as { fromPath?: string } | null)?.fromPath;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const pageUrl = fromPath ? `${window.location.origin}${fromPath}` : undefined;
      const { sent } = await submitBugReport({ description, stepsToReproduce: stepsToReproduce || undefined, pageUrl });
      if (!sent) {
        setStatus("error");
        setError("Couldn't send your report right now - bug reports aren't set up to be received yet. Please try again later.");
        return;
      }
      setDescription("");
      setStepsToReproduce("");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your report.");
      setStatus("error");
    }
  }

  if (!user) return null;

  return (
    <main>
      <h1>Report a bug</h1>
      <p>
        Sending as {user.name} &middot; {user.email}
      </p>
      <p className="field-hint">
        Have a general question instead? <Link to="/support">Contact support</Link> instead.
      </p>

      <form className="course-form" onSubmit={handleSubmit}>
        <label className="field">
          What happened?
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you see, and what did you expect instead?"
            required
          />
        </label>
        <label className="field">
          Steps to reproduce (optional)
          <textarea
            rows={4}
            value={stepsToReproduce}
            onChange={(e) => setStepsToReproduce(e.target.value)}
            placeholder="1. Go to...&#10;2. Click...&#10;3. See..."
          />
        </label>
        {error && <p className="import-error">{error}</p>}
        {status === "sent" && <p className="save-status save-status-ok">Sent - thanks for the report.</p>}
        <button type="submit" disabled={status === "sending" || !description.trim()}>
          {status === "sending" ? "Sending..." : "Send report"}
        </button>
      </form>
    </main>
  );
}
