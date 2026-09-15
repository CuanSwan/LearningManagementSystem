import path from "node:path";
import { MongoClient } from "mongodb";
import { createFileStore } from "./fileStore.js";
import { createMongoStore } from "./mongoStore.js";
import type { DocumentStore } from "./types.js";

export type { DocumentStore } from "./types.js";

export interface Database {
  createStore<T extends Record<string, unknown>>(collectionName: string, idField: keyof T & string): DocumentStore<T>;
  close(): Promise<void>;
}

const FILE_DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");

export async function connectDb(): Promise<Database> {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB ?? "lms");
    console.log("Connected to MongoDB");
    return {
      createStore(collectionName, idField) {
        return createMongoStore(db.collection(collectionName), idField);
      },
      close: () => client.close(),
    };
  }

  console.log(`MONGODB_URI not set - using JSON-file storage under ${FILE_DATA_DIR}`);
  return {
    createStore(collectionName, idField) {
      return createFileStore(FILE_DATA_DIR, collectionName, idField);
    },
    close: async () => {},
  };
}
