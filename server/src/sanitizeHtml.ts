import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// DOMPurify needs a DOM to sanitize against; there's no browser one on the
// server, so it's given a throwaway jsdom window (the documented way to run
// DOMPurify in Node - see DOMPurify's own README).
const window = new JSDOM("").window;
const purify = createDOMPurify(window as unknown as Window & typeof globalThis);

// Sanitizes HTML lesson content on the way into storage, not just on the way
// out at render time. Render-time sanitization alone only protects content
// that goes through that one rendering path - anything writing content
// straight to the API (bypassing the admin form entirely) would otherwise
// leave raw, unsanitized HTML sitting in the database, one forgotten
// sanitize() call away from executing somewhere.
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html);
}
