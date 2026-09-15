import type { Collection } from "mongodb";
import type { DocumentStore } from "./types.js";

function strip<T>(doc: (T & { _id?: unknown }) | null): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest as unknown as T;
}

export function createMongoStore<T extends Record<string, unknown>>(
  collection: Collection,
  idField: keyof T & string
): DocumentStore<T> {
  return {
    async list(filter) {
      const docs = await collection.find(filter ?? {}).toArray();
      return docs.map((doc) => strip<T>(doc as unknown as T)!);
    },

    async get(id) {
      const doc = await collection.findOne({ [idField]: id });
      return strip<T>(doc as unknown as T | null);
    },

    async set(id, doc) {
      await collection.replaceOne({ [idField]: id }, { ...doc, _id: id }, { upsert: true });
    },

    async update(id, patch) {
      const result = await collection.findOneAndUpdate(
        { [idField]: id },
        { $set: patch },
        { returnDocument: "after" }
      );
      return strip<T>(result as unknown as T | null);
    },

    async remove(id) {
      const result = await collection.deleteOne({ [idField]: id });
      return result.deletedCount > 0;
    },

    async count() {
      return collection.countDocuments();
    },
  };
}
