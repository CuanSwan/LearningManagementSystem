import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./fileStore.js";

interface Widget extends Record<string, unknown> {
  widgetId: string;
  name: string;
  color?: string;
}

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "filestore-test-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("createFileStore", () => {
  it("starts empty and lists nothing", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    expect(await store.list()).toEqual([]);
    expect(await store.count()).toBe(0);
  });

  it("set() then get() round-trips a document", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    await store.set("w1", { widgetId: "w1", name: "Gizmo" });
    expect(await store.get("w1")).toEqual({ widgetId: "w1", name: "Gizmo" });
  });

  it("set() replaces an existing document with the same id", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    await store.set("w1", { widgetId: "w1", name: "Gizmo" });
    await store.set("w1", { widgetId: "w1", name: "Gadget" });
    expect(await store.get("w1")).toEqual({ widgetId: "w1", name: "Gadget" });
    expect(await store.count()).toBe(1);
  });

  it("update() merges a patch and returns the updated document", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    await store.set("w1", { widgetId: "w1", name: "Gizmo", color: "red" });
    const updated = await store.update("w1", { color: "blue" });
    expect(updated).toEqual({ widgetId: "w1", name: "Gizmo", color: "blue" });
  });

  it("update() returns null for a missing id", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    expect(await store.update("missing", { color: "blue" })).toBeNull();
  });

  it("remove() deletes a document and reports success", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    await store.set("w1", { widgetId: "w1", name: "Gizmo" });
    expect(await store.remove("w1")).toBe(true);
    expect(await store.get("w1")).toBeNull();
    expect(await store.remove("w1")).toBe(false);
  });

  it("list() filters by equality on the given fields", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    await store.set("w1", { widgetId: "w1", name: "Gizmo", color: "red" });
    await store.set("w2", { widgetId: "w2", name: "Gadget", color: "blue" });
    expect(await store.list({ color: "red" })).toEqual([{ widgetId: "w1", name: "Gizmo", color: "red" }]);
  });

  it("survives many concurrent set() calls without losing writes (regression: shared-cache race)", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    await Promise.all(
      Array.from({ length: 20 }, (_, i) => store.set(`w${i}`, { widgetId: `w${i}`, name: `Widget ${i}` }))
    );
    expect(await store.count()).toBe(20);

    const reloaded = createFileStore<Widget>(dir, "widgets", "widgetId");
    expect(await reloaded.count()).toBe(20);
  });

  it("persists data across a fresh store instance pointed at the same directory", async () => {
    const store = createFileStore<Widget>(dir, "widgets", "widgetId");
    await store.set("w1", { widgetId: "w1", name: "Gizmo" });

    const reloaded = createFileStore<Widget>(dir, "widgets", "widgetId");
    expect(await reloaded.get("w1")).toEqual({ widgetId: "w1", name: "Gizmo" });
  });
});
