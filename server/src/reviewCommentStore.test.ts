import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./db/fileStore.js";
import type { Database } from "./db/index.js";
import { createReviewComment, initReviewCommentStore, listCommentsForLesson } from "./reviewCommentStore.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "reviewcomment-test-"));
  const db: Database = {
    createStore: async (collectionName, idField) => createFileStore(dir, collectionName, idField),
    close: async () => {},
  };
  await initReviewCommentStore(db);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("createReviewComment", () => {
  it("creates a comment with a generated id and timestamp", async () => {
    const comment = await createReviewComment({
      lessonId: "l1",
      moduleId: "m1",
      authorUserId: "u1",
      authorName: "Rita Reviewer",
      body: "This example is out of date.",
    });
    expect(comment.commentId).toBeTruthy();
    expect(comment.createdAt).toBeGreaterThan(0);
    expect(comment.body).toBe("This example is out of date.");
  });
});

describe("listCommentsForLesson", () => {
  it("returns only comments for the requested lesson", async () => {
    await createReviewComment({ lessonId: "l1", moduleId: "m1", authorUserId: "u1", authorName: "Rita", body: "A" });
    await createReviewComment({ lessonId: "l2", moduleId: "m1", authorUserId: "u1", authorName: "Rita", body: "B" });

    const comments = await listCommentsForLesson("l1");
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe("A");
  });

  it("returns an empty array for a lesson with no comments", async () => {
    expect(await listCommentsForLesson("nothing-here")).toEqual([]);
  });
});
