import { describe, expect, it, vi } from "vitest";
import { ensureIndexes } from "./index.js";

function fakeCollection(createIndex: ReturnType<typeof vi.fn>) {
  return { collectionName: "widgets", createIndex } as never;
}

describe("ensureIndexes", () => {
  it("creates a unique index when asked", async () => {
    const createIndex = vi.fn().mockResolvedValue("email_1");
    await ensureIndexes(fakeCollection(createIndex), [{ fields: { email: 1 }, unique: true }]);
    expect(createIndex).toHaveBeenCalledWith({ email: 1 }, { unique: true });
  });

  it("creates a plain index when unique isn't requested", async () => {
    const createIndex = vi.fn().mockResolvedValue("email_1");
    await ensureIndexes(fakeCollection(createIndex), [{ fields: { email: 1 } }]);
    expect(createIndex).toHaveBeenCalledWith({ email: 1 }, undefined);
  });

  it("falls back to a non-unique index if duplicates already exist, instead of failing startup", async () => {
    const duplicateKeyError = Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
    const createIndex = vi
      .fn()
      .mockRejectedValueOnce(duplicateKeyError)
      .mockResolvedValueOnce("email_1");
    await ensureIndexes(fakeCollection(createIndex), [{ fields: { email: 1 }, unique: true }]);
    expect(createIndex).toHaveBeenNthCalledWith(1, { email: 1 }, { unique: true });
    expect(createIndex).toHaveBeenNthCalledWith(2, { email: 1 });
  });

  it("re-throws any other index creation error", async () => {
    const createIndex = vi.fn().mockRejectedValue(new Error("connection lost"));
    await expect(ensureIndexes(fakeCollection(createIndex), [{ fields: { email: 1 }, unique: true }])).rejects.toThrow(
      "connection lost"
    );
  });
});
