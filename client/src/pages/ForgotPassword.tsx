import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api.js";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Always ends in the same "check your email" state, whether or not the
    // address has an account - the server already never reveals which, so
    // there's nothing for this form to branch on either.
    await forgotPassword(email);
    setSent(true);
    setSubmitting(false);
  }

  if (sent) {
    return (
      <main className="auth-page">
        <div className="course-form auth-form">
          <h1>Check your email</h1>
          <p>If an account exists for {email}, a password reset link is on its way. It expires in one hour.</p>
          <p className="auth-switch">
            <Link to="/login">Back to log in</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <form className="course-form auth-form" onSubmit={handleSubmit}>
        <h1>Forgot your password?</h1>
        <p>Enter your account's email address and we'll send you a link to reset it.</p>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send reset link"}
        </button>
        <p className="auth-switch">
          <Link to="/login">Back to log in</Link>
        </p>
      </form>
    </main>
  );
}
