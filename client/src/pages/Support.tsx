import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { submitSupportMessage } from "../api.js";
import { useAuth } from "../auth.js";

export function Support() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const { sent } = await submitSupportMessage(message);
      if (!sent) {
        setStatus("error");
        setError("Couldn't send your message right now - support isn't set up to receive messages yet. Please try again later.");
        return;
      }
      setMessage("");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your message.");
      setStatus("error");
    }
  }

  if (!user) return null;

  return (
    <main>
      <h1>Contact support</h1>
      <p>
        Sending as {user.name} &middot; {user.email}
      </p>
      <p className="field-hint">
        Found a bug rather than a general question? <Link to="/report-bug">Report a bug</Link> instead - it collects a
        couple of extra details that help track the issue down.
      </p>

      <form className="course-form" onSubmit={handleSubmit}>
        <label className="field">
          How can we help?
          <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
        </label>
        {error && <p className="import-error">{error}</p>}
        {status === "sent" && <p className="save-status save-status-ok">Sent - thanks, we'll get back to you.</p>}
        <button type="submit" disabled={status === "sending" || !message.trim()}>
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
      </form>
    </main>
  );
}
