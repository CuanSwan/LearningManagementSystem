const DAY_MS = 24 * 60 * 60 * 1000;

// Rounds up rather than down/truncating - with a few hours left before
// expiry, "0 days remaining" reads as already-expired even though access
// still works right now, which is actively misleading right before the
// cutoff. Clamped at 0 for the (in practice unreachable, since the login
// middleware kills an expired session on its very next request) case of
// a still-live session whose expiresAt has already passed.
export function daysRemaining(expiresAt: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((expiresAt - now) / DAY_MS));
}

export function daysRemainingLabel(expiresAt: number, now: number = Date.now()): string {
  const days = daysRemaining(expiresAt, now);
  if (days === 0) return "Access expires today";
  if (days === 1) return "1 day remaining";
  return `${days} days remaining`;
}
