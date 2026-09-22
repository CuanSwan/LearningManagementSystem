import { useEffect, useState, type FormEvent } from "react";
import type { User, UserRole, Voucher } from "../types.js";
import { createVoucher, listUsers, listVouchers, resetUserPassword, revokeVoucher, setUserRole } from "../api.js";
import { useAuth } from "../auth.js";

function formatDate(ms: number | undefined): string {
  return ms === undefined ? "never" : new Date(ms).toLocaleDateString();
}

function voucherSignUpLink(voucherId: string): string {
  return `${window.location.origin}/register?voucher=${voucherId}`;
}

// A voucher stays "pending" in storage even once its year runs out -
// nothing proactively flips it, since the whole check happens lazily at
// register/login time. Computed here purely for display, so an admin
// doesn't see a stale "Pending" on something that's actually unusable now.
// Admin/super_admin vouchers have no expiresAt at all - they never expire.
function voucherDisplayStatus(voucher: Voucher): "pending" | "expired" | "registered" | "revoked" {
  if (voucher.status === "pending" && voucher.expiresAt !== undefined && Date.now() > voucher.expiresAt) return "expired";
  return voucher.status;
}

export function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [issueStatus, setIssueStatus] = useState<"idle" | "issuing" | "issued" | "error">("idle");
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issuedLink, setIssuedLink] = useState<string | null>(null);
  const [issuedEmailSent, setIssuedEmailSent] = useState(true);
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);

  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDoneUserId, setResetDoneUserId] = useState<string | null>(null);

  const canIssuePrivileged = me?.role === "super_admin";

  useEffect(() => {
    listUsers().then(setUsers);
    listVouchers().then(setVouchers);
  }, []);

  function startReset(userId: string) {
    setResettingUserId(userId);
    setResetPassword("");
    setResetError(null);
    setResetDoneUserId(null);
  }

  async function handleResetSubmit(e: FormEvent, userId: string) {
    e.preventDefault();
    setResetError(null);
    try {
      await resetUserPassword(userId, resetPassword);
      setResettingUserId(null);
      setResetPassword("");
      setResetDoneUserId(userId);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Could not reset password.");
    }
  }

  async function handleIssue(e: FormEvent) {
    e.preventDefault();
    setIssueStatus("issuing");
    setIssueError(null);
    setIssuedLink(null);
    try {
      const { voucher, emailSent } = await createVoucher({ name, email, role });
      setVouchers((prev) => [voucher, ...prev]);
      setIssuedLink(voucherSignUpLink(voucher.voucherId));
      setIssuedEmailSent(emailSent);
      setIssueStatus("issued");
      setName("");
      setEmail("");
      setRole("student");
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : "Could not issue voucher.");
      setIssueStatus("error");
    }
  }

  async function handleCopyLink(voucherId: string) {
    await navigator.clipboard.writeText(voucherSignUpLink(voucherId));
    setCopiedVoucherId(voucherId);
    setTimeout(() => setCopiedVoucherId((current) => (current === voucherId ? null : current)), 2000);
  }

  async function handleRevoke(voucherId: string) {
    const updated = await revokeVoucher(voucherId);
    setVouchers((prev) => prev.map((v) => (v.voucherId === voucherId ? updated : v)));
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    const updated = await setUserRole(userId, newRole);
    setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
  }

  return (
    <main>
      <h1>Users</h1>
      <p>
        Every account - student, admin, or super admin - starts as a voucher: issue one below and it's emailed as a
        sign-up link, valid for one year from today.
      </p>

      <ul className="user-list">
        {users.map((u) => (
          <li key={u.userId} className="user-list-item">
            <div>
              <strong>{u.name}</strong>
              <span className="module-status"> {u.email}</span>
              {u.membershipExpiresAt !== undefined && (
                <span className="module-status">
                  {" "}
                  &middot; member since {formatDate(u.memberSince!)}, expires {formatDate(u.membershipExpiresAt)}
                </span>
              )}
            </div>
            <div className="user-list-item-actions">
              <select value={u.role} onChange={(e) => handleRoleChange(u.userId, e.target.value as UserRole)}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
              {resettingUserId === u.userId ? (
                <form className="reset-password-form" onSubmit={(e) => handleResetSubmit(e, u.userId)}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    minLength={8}
                    required
                    autoFocus
                  />
                  <button type="submit">Set</button>
                  <button type="button" onClick={() => setResettingUserId(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <button type="button" onClick={() => startReset(u.userId)}>
                  Reset password
                </button>
              )}
              {resetDoneUserId === u.userId && <span className="save-status save-status-ok">Password reset</span>}
            </div>
          </li>
        ))}
      </ul>
      {resettingUserId && resetError && <p className="import-error">{resetError}</p>}

      <form className="course-form" onSubmit={handleIssue}>
        <h2>Issue an invitation</h2>
        <label className="field">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          Role
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="student">Student</option>
            {canIssuePrivileged && <option value="admin">Admin</option>}
            {canIssuePrivileged && <option value="super_admin">Super admin</option>}
          </select>
        </label>
        {issueError && <p className="import-error">{issueError}</p>}
        <button type="submit" disabled={issueStatus === "issuing"}>
          {issueStatus === "issuing" ? "Issuing..." : "Issue invitation"}
        </button>
        {issueStatus === "issued" && issuedLink && (
          <p className="save-status save-status-ok">
            {issuedEmailSent ? "Invitation emailed." : "Couldn't send the email - copy the link below and share it directly."}{" "}
            <a href={issuedLink}>{issuedLink}</a>
          </p>
        )}
      </form>

      <section>
        <h2>Invitations</h2>
        {vouchers.length === 0 ? (
          <p>No invitations issued yet.</p>
        ) : (
          <ul className="user-list">
            {vouchers.map((v) => {
              const status = voucherDisplayStatus(v);
              const canManage = v.role === "student" || canIssuePrivileged;
              return (
                <li key={v.voucherId} className="user-list-item">
                  <div>
                    <strong>{v.name}</strong>
                    <span className="module-status"> {v.email}</span>
                    <span className="module-status">
                      {" "}
                      &middot; {v.role} &middot; {status} &middot; issued {formatDate(v.issuedAt)}, expires{" "}
                      {formatDate(v.expiresAt)}
                    </span>
                  </div>
                  {status === "pending" && canManage && (
                    <div className="user-list-item-actions">
                      <button type="button" onClick={() => handleCopyLink(v.voucherId)}>
                        {copiedVoucherId === v.voucherId ? "Copied!" : "Copy link"}
                      </button>
                      <button type="button" onClick={() => handleRevoke(v.voucherId)}>
                        Revoke
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
