import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api.js";
import { PASSWORD_HINT, passwordMeetsRequirements } from "../passwordRules.js";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitError(null);
    if (password !== confirmPassword) {
      setSubmitError("Passwords don't match.");
      return;
    }
    if (!passwordMeetsRequirements(password)) {
      setSubmitError(PASSWORD_HINT);
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not reset password.");
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="auth-page">
        <div className="course-form auth-form">
          <h1>Can&apos;t reset this password</h1>
          <p className="import-error">This reset link is missing its token.</p>
          <p className="auth-switch">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="auth-page">
        <div className="course-form auth-form">
          <h1>Password updated</h1>
          <p>Your password has been reset. You can now log in with it.</p>
          <button type="button" onClick={() => navigate("/login", { replace: true })}>
            Go to log in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <form className="course-form auth-form" onSubmit={handleSubmit}>
        <h1>Set a new password</h1>
        <label className="field">
          <span className="field-label">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <span className="field-hint">{PASSWORD_HINT}</span>
        </label>
        <label className="field">
          <span className="field-label">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {submitError && <p className="import-error">{submitError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Resetting..." : "Reset password"}
        </button>
        <p className="auth-switch">
          <Link to="/login">Back to log in</Link>
        </p>
      </form>
    </main>
  );
}
