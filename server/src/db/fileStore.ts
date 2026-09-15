import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DocumentStore } from "./types.js";

/**
 * A JSON-file-backed stand-in for a real MongoDB collection, used when no
 * MONGODB_URI is configured (e.g. this sandbox, or local dev without a
 * database running). Data is loaded into memory once and rewritten to disk
 * on every mutation - fine for this app's write volume, and it means data
 * actually survives a server restart, unlike the old in-memory Maps.
 */
export function createFileStore<T extends Record<string, unknown>>(
  dataDir: string,
  collectionName: string,
  idField: keyof T & string
): DocumentStore<T> {
  const filePath = path.join(dataDir, `${collectionName}.json`);
  let cache: T[] | null = null;
  // Every operation is chained onto this queue so concurrent calls (e.g. a
  // Promise.all of several seed writes) run one at a time instead of
  // racing on the shared in-memory cache and clobbering each other.
  let queue: Promise<unknown> = Promise.resolve();

  function enqueue<R>(fn: () => Promise<R>): Promise<R> {
    const result = queue.then(fn);
    queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  async function ensureLoaded(): Promise<T[]> {
    if (cache) return cache;
    try {
      const raw = await readFile(filePath, "utf-8");
      cache = JSON.parse(raw) as T[];
    } catch {
      cache = [];
    }
    return cache;
  }

  async function persist(): Promise<void> {
    await mkdir(dataDir, { recursive: true });
    await writeFile(filePath, JSON.stringify(cache, null, 2), "utf-8");
  }

  function matches(doc: T, filter?: Partial<T>): boolean {
    if (!filter) return true;
    return Object.entries(filter).every(([key, value]) => doc[key as keyof T] === value);
  }

  return {
    list(filter) {
      return enqueue(async () => {
        const docs = await ensureLoaded();
        return docs.filter((doc) => matches(doc, filter));
      });
    },

    get(id) {
      return enqueue(async () => {
        const docs = await ensureLoaded();
        return docs.find((doc) => doc[idField] === id) ?? null;
      });
    },

    set(id, doc) {
      return enqueue(async () => {
        const docs = await ensureLoaded();
        const index = docs.findIndex((existing) => existing[idField] === id);
        if (index === -1) docs.push(doc);
        else docs[index] = doc;
        await persist();
      });
    },

    update(id, patch) {
      return enqueue(async () => {
        const docs = await ensureLoaded();
        const index = docs.findIndex((existing) => existing[idField] === id);
        if (index === -1) return null;
        docs[index] = { ...docs[index], ...patch };
        await persist();
        return docs[index];
      });
    },

    remove(id) {
      return enqueue(async () => {
        const docs = await ensureLoaded();
        const index = docs.findIndex((existing) => existing[idField] === id);
        if (index === -1) return false;
        docs.splice(index, 1);
        await persist();
        return true;
      });
    },

    count() {
      return enqueue(async () => {
        const docs = await ensureLoaded();
        return docs.length;
      });
    },
  };
}
