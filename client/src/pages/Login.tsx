import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.js";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
      navigate(from ? `${from.pathname}${from.search}` : "/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    }
  }

  return (
    <main className="auth-page">
      <form className="course-form auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-welcome">Welcome</h1>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="import-error">{error}</p>}
        <button type="submit">Log in</button>
        <p className="auth-switch">
          New here? <Link to="/register">Create a student account</Link>
        </p>
      </form>
    </main>
  );
}
