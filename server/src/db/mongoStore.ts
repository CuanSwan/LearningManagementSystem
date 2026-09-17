import type { Collection, Document, Filter } from "mongodb";
import type { DocumentStore } from "./types.js";

function strip<T>(doc: (T & { _id?: unknown }) | null): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest as unknown as T;
}

// The driver's default Document type assumes a real ObjectId _id; ours is
// always the same string as the document's own id field (see set() below),
// so this just tells TypeScript that's an intentional, valid filter shape.
function byId(id: string): Filter<Document> {
  return { _id: id } as unknown as Filter<Document>;
}

export function createMongoStore<T extends Record<string, unknown>>(
  collection: Collection,
  // Kept only for interface parity with createFileStore, which has no
  // implicit id field of its own and genuinely needs it. set() below always
  // stores the id as _id too, so every lookup-by-id here can (and should)
  // filter on _id instead - it's the one field MongoDB indexes for free,
  // where filtering on an arbitrary field like `courseId` would otherwise
  // be a full collection scan on every single get/update/remove.
  _idField: keyof T & string
): DocumentStore<T> {
  return {
    async list(filter) {
      const docs = await collection.find(filter ?? {}).toArray();
      return docs.map((doc) => strip<T>(doc as unknown as T)!);
    },

    async get(id) {
      const doc = await collection.findOne(byId(id));
      return strip<T>(doc as unknown as T | null);
    },

    async set(id, doc) {
      await collection.replaceOne(byId(id), { ...doc, _id: id }, { upsert: true });
    },

    async update(id, patch) {
      const result = await collection.findOneAndUpdate(byId(id), { $set: patch }, { returnDocument: "after" });
      return strip<T>(result as unknown as T | null);
    },

    async remove(id) {
      const result = await collection.deleteOne(byId(id));
      return result.deletedCount > 0;
    },

    async count() {
      return collection.countDocuments();
    },
  };
}
