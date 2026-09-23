// crypto.randomUUID() only exists in a secure context (HTTPS, or
// localhost/127.0.0.1) - on a plain-HTTP deployment, e.g. reached over a LAN
// IP without TLS, the browser's crypto object simply doesn't have it, and
// calling it throws "crypto.randomUUID is not a function". These ids are
// only ever used for client-side identity (never a security token), so a
// same-shape non-cryptographic fallback is fine when the real thing isn't
// available.
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
