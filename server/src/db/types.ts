/**
 * A minimal, Mongo-shaped document store: every document is a plain JSON
 * object keyed by one designated id field. This is the only contract the
 * rest of the server talks to - store.ts, userStore.ts, etc. don't know or
 * care whether documents are actually sitting in MongoDB or a JSON file.
 */
export interface DocumentStore<T> {
  list(filter?: Partial<T>): Promise<T[]>;
  get(id: string): Promise<T | null>;
  set(id: string, doc: T): Promise<void>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
  count(): Promise<number>;
}
