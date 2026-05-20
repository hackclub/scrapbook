import assert from "node:assert/strict";
import test from "node:test";
import { checkpointAfterBatch, emptyCheckpoint } from "../src/output/checkpoint.js";

test("checkpointAfterBatch stores stable cursor fields and counters", () => {
  const checkpoint = checkpointAfterBatch(
    emptyCheckpoint(),
    new Date("2025-01-01T00:00:00.000Z"),
    "update_123",
    {
      postsScanned: 10,
      postsModerated: 3,
      postsSkippedTrusted: 7,
      errors: 1
    }
  );

  assert.equal(checkpoint.lastPostTime, "2025-01-01T00:00:00.000Z");
  assert.equal(checkpoint.lastUpdateId, "update_123");
  assert.equal(checkpoint.postsScanned, 10);
  assert.equal(checkpoint.postsModerated, 3);
  assert.equal(checkpoint.postsSkippedTrusted, 7);
  assert.equal(checkpoint.errors, 1);
});
