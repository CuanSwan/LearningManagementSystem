// Same source as api.ts's own API_BASE_URL - kept as its own small constant
// here rather than imported from api.ts, since this needs no other part of
// api.ts and stays a plain pure module this way (see resolveAssetUrl.test.ts).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// An uploaded image (see uploadImage in api.ts) is returned as a path
// relative to the API, e.g. "/api/uploads/xyz.png" - client and API can be
// on different origins in production, so it needs the same API_BASE_URL
// prefix every other API call already gets, or it'd resolve against the
// client's own origin instead. A pasted external URL (or a data: URI) is
// already absolute and is returned unchanged; an empty string (no image
// set yet) is also left alone rather than turned into a bare API origin.
export function resolveAssetUrl(url: string): string {
  if (!url) return url;
  return /^(https?:|data:|blob:)/i.test(url) ? url : `${API_BASE_URL}${url}`;
}
