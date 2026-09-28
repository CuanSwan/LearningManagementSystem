import { describe, expect, it } from "vitest";
import { resolveAssetUrl } from "./assetUrl.js";

describe("resolveAssetUrl", () => {
  it("leaves an empty string alone rather than turning it into a bare API origin", () => {
    expect(resolveAssetUrl("")).toBe("");
  });

  it("leaves an already-absolute http(s) URL untouched", () => {
    expect(resolveAssetUrl("https://example.com/photo.png")).toBe("https://example.com/photo.png");
    expect(resolveAssetUrl("http://example.com/photo.png")).toBe("http://example.com/photo.png");
  });

  it("leaves a data: URI untouched", () => {
    expect(resolveAssetUrl("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
  });

  it("leaves a blob: URL untouched", () => {
    expect(resolveAssetUrl("blob:https://example.com/abc-123")).toBe("blob:https://example.com/abc-123");
  });

  it("prefixes a relative uploaded-image path with the API base URL", () => {
    // VITE_API_BASE_URL is unset in the test env, so this resolves to "" -
    // the relative path itself is still what's under test here.
    expect(resolveAssetUrl("/api/uploads/xyz.png")).toBe("/api/uploads/xyz.png");
  });
});
