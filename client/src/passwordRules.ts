// Mirrors the server's PasswordSchema (server/src/userSchema.ts) - the
// server is the actual authority (this app has no shared package between
// client/server, so it's duplicated rather than imported), but checking
// here too means a weak password or a mismatched confirmation is caught
// before a round trip, not just after a 400 comes back.
export const PASSWORD_HINT = "At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a symbol.";

export function passwordMeetsRequirements(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}
