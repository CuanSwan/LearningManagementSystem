import { describe, expect, it, vi } from "vitest";
import { createMongoStore } from "./mongoStore.js";

// A fake Collection that only records the filter each method was called
// with - real MongoDB integration is out of scope here (no mongod/memory
// server in this repo), but the whole point of this fix is "which filter
// object gets sent," which a fake collection can verify directly.
function fakeCollection() {
  return {
    find: vi.fn().mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
    findOne: vi.fn().mockResolvedValue(null),
    replaceOne: vi.fn().mockResolvedValue({}),
    findOneAndUpdate: vi.fn().mockResolvedValue(null),
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    countDocuments: vi.fn().mockResolvedValue(0),
  };
}

interface Widget extends Record<string, unknown> {
  widgetId: string;
  name: string;
}

describe("createMongoStore", () => {
  it("get() filters by _id, not the collection's own id field", async () => {
    const collection = fakeCollection();
    const store = createMongoStore<Widget>(collection as never, "widgetId");
    await store.get("w1");
    expect(collection.findOne).toHaveBeenCalledWith({ _id: "w1" });
  });

  it("set() both filters and replaces by _id", async () => {
    const collection = fakeCollection();
    const store = createMongoStore<Widget>(collection as never, "widgetId");
    await store.set("w1", { widgetId: "w1", name: "Gizmo" });
    expect(collection.replaceOne).toHaveBeenCalledWith(
      { _id: "w1" },
      { widgetId: "w1", name: "Gizmo", _id: "w1" },
      { upsert: true }
    );
  });

  it("update() filters by _id", async () => {
    const collection = fakeCollection();
    const store = createMongoStore<Widget>(collection as never, "widgetId");
    await store.update("w1", { name: "Gadget" });
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: "w1" },
      { $set: { name: "Gadget" } },
      { returnDocument: "after" }
    );
  });

  it("remove() filters by _id", async () => {
    const collection = fakeCollection();
    const store = createMongoStore<Widget>(collection as never, "widgetId");
    await store.remove("w1");
    expect(collection.deleteOne).toHaveBeenCalledWith({ _id: "w1" });
  });

  it("list() still filters by whatever fields are given, unrelated to _id", async () => {
    const collection = fakeCollection();
    const store = createMongoStore<Widget>(collection as never, "widgetId");
    await store.list({ name: "Gizmo" });
    expect(collection.find).toHaveBeenCalledWith({ name: "Gizmo" });
  });
});
