import { useState, type FormEvent } from "react";
import { changeMyPassword } from "../api.js";
import { useAuth } from "../auth.js";
import { PASSWORD_HINT, passwordMeetsRequirements } from "../passwordRules.js";

export function Account() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      setStatus("error");
      return;
    }
    if (!passwordMeetsRequirements(newPassword)) {
      setError(PASSWORD_HINT);
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      await changeMyPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
      setStatus("error");
    }
  }

  if (!user) return null;

  return (
    <main>
      <h1>Account</h1>
      <p>
        {user.name} &middot; {user.email}
      </p>

      <form className="course-form" onSubmit={handleSubmit}>
        <h2>Change password</h2>
        <label className="field">
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label className="field">
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <span className="field-hint">{PASSWORD_HINT}</span>
        </label>
        <label className="field">
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="import-error">{error}</p>}
        {status === "saved" && <p className="save-status save-status-ok">Password updated.</p>}
        <button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Update password"}
        </button>
      </form>
    </main>
  );
}
