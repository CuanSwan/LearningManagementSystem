import { afterEach, describe, expect, it, vi } from "vitest";
import { generateId } from "./id.js";

describe("generateId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses crypto.randomUUID() when the browser provides it", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111");
    expect(generateId()).toBe("11111111-1111-4111-8111-111111111111");
  });

  // Regression: an insecure context (e.g. a plain-HTTP LAN deployment) has
  // no crypto.randomUUID at all - calling it throws "crypto.randomUUID is
  // not a function". generateId must still produce a usable id instead of
  // throwing.
  it("falls back to a Math.random-based id when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("produces different ids on each call", () => {
    vi.stubGlobal("crypto", {});
    expect(generateId()).not.toBe(generateId());
  });
});
