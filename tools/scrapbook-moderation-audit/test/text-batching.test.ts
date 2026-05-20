import assert from "node:assert/strict";
import test from "node:test";
import { buildTextModerationGroupsForTest } from "../src/index.js";
import type { AuditConfig } from "../src/config.js";

function config(overrides: Partial<AuditConfig>): AuditConfig {
  return {
    auditDatabaseUrl: undefined,
    pgDatabaseUrl: "postgresql://example",
    openaiApiKey: "sk-test",
    moderationModel: "omni-moderation-latest",
    batchSize: 100,
    concurrency: 2,
    sleepMs: 0,
    maxImagesPerPost: 4,
    maxImageBytes: 20,
    maxConsecutiveInfraErrors: 10,
    openaiRequestsPerMinute: 200,
    openaiTokensPerMinute: 4500,
    openaiRequestsPerRun: 9000,
    openaiTokensPerRun: 900000,
    openaiTextBatchSize: 2,
    openaiTextBatchTokenLimit: 10,
    trustedGoodPostThreshold: 15,
    newAccountYears: 2,
    outputFile: "out.json",
    checkpointFile: "checkpoint.json",
    errorLogFile: "errors.jsonl",
    errorReportFile: "error-report.json",
    dryRun: false,
    resume: false,
    limit: undefined,
    createdAfter: new Date("2024-01-01T00:00:00.000Z"),
    createdBefore: undefined,
    user: undefined,
    includeRawOpenAI: false,
    includeFullContent: false,
    databaseUrl: "postgresql://example",
    ...overrides
  };
}

const item = (text: string) => ({
  text,
  update: {} as never,
  user: {} as never,
  knownGoodPostCount: 0,
  imageUrls: [],
  localReasons: [],
  priority: "regular" as const
});

test("buildTextModerationGroupsForTest batches by count", () => {
  const groups = buildTextModerationGroupsForTest([item("a"), item("b"), item("c")], config({}));
  assert.deepEqual(groups.map((group) => group.length), [2, 1]);
});

test("buildTextModerationGroupsForTest batches by estimated token limit", () => {
  const groups = buildTextModerationGroupsForTest(
    [item("a".repeat(20)), item("b".repeat(20)), item("c")],
    config({ openaiTextBatchSize: 10, openaiTextBatchTokenLimit: 6 })
  );
  assert.deepEqual(groups.map((group) => group.length), [1, 2]);
});
