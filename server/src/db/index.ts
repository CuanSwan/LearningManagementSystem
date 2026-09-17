import path from "node:path";
import { MongoClient, type Collection } from "mongodb";
import { createFileStore } from "./fileStore.js";
import { createMongoStore } from "./mongoStore.js";
import type { DocumentStore } from "./types.js";

export type { DocumentStore } from "./types.js";

// A secondary index a store wants beyond the free one MongoDB gives every
// document on _id - e.g. users looking themselves up by email. Meaningless
// for the file-store backend, which always scans everything anyway, so it's
// silently ignored there.
export interface IndexSpec {
  fields: Record<string, 1 | -1>;
  unique?: boolean;
}

export interface Database {
  createStore<T extends Record<string, unknown>>(
    collectionName: string,
    idField: keyof T & string,
    indexes?: IndexSpec[]
  ): Promise<DocumentStore<T>>;
  close(): Promise<void>;
}

const FILE_DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");

export async function ensureIndexes(collection: Collection, indexes: IndexSpec[]): Promise<void> {
  for (const spec of indexes) {
    try {
      await collection.createIndex(spec.fields, spec.unique ? { unique: true } : undefined);
    } catch (err) {
      // 11000 is Mongo's duplicate-key error - it means data written before
      // this constraint existed already violates it. Refusing to start the
      // server over that would turn a data-quality issue into an outage, so
      // fall back to a non-unique index (still fixes the unindexed-scan
      // problem) and say clearly what needs manual cleanup.
      if (spec.unique && (err as { code?: number }).code === 11000) {
        console.warn(
          `Could not create a unique index on ${collection.collectionName}${JSON.stringify(spec.fields)} - ` +
            "duplicate values already exist. Falling back to a non-unique index; dedupe the existing data to enable the uniqueness constraint."
        );
        await collection.createIndex(spec.fields);
      } else {
        throw err;
      }
    }
  }
}

export async function connectDb(): Promise<Database> {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    // Some hosts (e.g. Render) black-hole outbound IPv6, which the driver's
    // TLS handshake to Atlas surfaces as a confusing "tlsv1 alert internal
    // error" instead of a clean connection failure. Forcing IPv4 avoids it.
    const client = new MongoClient(uri, { family: 4 });
    await client.connect();
    const db = client.db(process.env.MONGODB_DB ?? "lms");
    console.log("Connected to MongoDB");
    return {
      async createStore(collectionName, idField, indexes) {
        const collection = db.collection(collectionName);
        if (indexes?.length) await ensureIndexes(collection, indexes);
        return createMongoStore(collection, idField);
      },
      close: () => client.close(),
    };
  }

  console.log(`MONGODB_URI not set - using JSON-file storage under ${FILE_DATA_DIR}`);
  return {
    async createStore(collectionName, idField) {
      return createFileStore(FILE_DATA_DIR, collectionName, idField);
    },
    close: async () => {},
  };
}
