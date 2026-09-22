import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { PublicVoucher } from "../types.js";
import { getVoucherPublic } from "../api.js";
import { useAuth } from "../auth.js";

const ROLE_LABELS: Record<PublicVoucher["role"], string> = {
  student: "student",
  admin: "admin",
  super_admin: "super admin",
};

// Registration only ever happens by invitation now - a voucher an admin
// issued (see AdminUsers.tsx), carrying the name/role/email it's valid
// for. There's no name field here: the voucher already has one, and the
// server copies it rather than trusting whatever this form might submit.
export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const voucherId = searchParams.get("voucher");

  const [voucher, setVoucher] = useState<PublicVoucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [loadingVoucher, setLoadingVoucher] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!voucherId) {
      setLoadingVoucher(false);
      return;
    }
    getVoucherPublic(voucherId)
      .then((v) => {
        setVoucher(v);
        setEmail(v.email);
      })
      .catch((err) => setVoucherError(err instanceof Error ? err.message : "This invitation link isn't valid."))
      .finally(() => setLoadingVoucher(false));
  }, [voucherId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!voucherId) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await register(voucherId, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not create account.");
      setSubmitting(false);
    }
  }

  if (loadingVoucher) {
    return (
      <main className="auth-page">
        <p>Loading...</p>
      </main>
    );
  }

  // No voucher at all, the lookup failed, or it's not usable - none of
  // these are worth showing a form for, since submitting would just fail
  // the same way server-side anyway.
  const unusableReason =
    !voucherId || voucherError
      ? (voucherError ?? "This registration link is missing an invitation.")
      : voucher?.status === "revoked"
        ? "This invitation has been revoked."
        : voucher?.status === "registered"
          ? "This invitation has already been used."
          : voucher && voucher.expiresAt !== undefined && Date.now() > voucher.expiresAt
            ? "This invitation has expired. Ask an admin to issue a new one."
            : null;

  if (unusableReason || !voucher) {
    return (
      <main className="auth-page">
        <div className="course-form auth-form">
          <h1>Can&apos;t create this account</h1>
          <p className="import-error">{unusableReason}</p>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <form className="course-form auth-form" onSubmit={handleSubmit}>
        <h1>Welcome, {voucher.name}</h1>
        <p>
          You&apos;re setting up a {ROLE_LABELS[voucher.role]} account. Confirm the email address this invitation was
          sent to and choose a password to finish.
        </p>
        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {submitError && <p className="import-error">{submitError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
