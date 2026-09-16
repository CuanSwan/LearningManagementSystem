import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "./sanitizeHtml.js";

describe("sanitizeHtml", () => {
  it("strips <script> tags entirely", () => {
    expect(sanitizeHtml("<p>Hi</p><script>evil()</script>")).toBe("<p>Hi</p>");
  });

  it("strips inline event handler attributes", () => {
    expect(sanitizeHtml('<p onclick="evil()">Click</p>')).toBe("<p>Click</p>");
  });

  it("strips onerror on an img tag but keeps the tag", () => {
    expect(sanitizeHtml('<img src="x" onerror="evil()">')).toBe('<img src="x">');
  });

  it("keeps ordinary safe markup untouched", () => {
    expect(sanitizeHtml("<h3>Title</h3><p>Body text.</p>")).toBe("<h3>Title</h3><p>Body text.</p>");
  });

  it("strips a javascript: href", () => {
    const result = sanitizeHtml('<a href="javascript:evil()">link</a>');
    expect(result).not.toContain("javascript:");
  });
});
