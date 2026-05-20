import assert from "node:assert/strict";
import test from "node:test";
import {
  estimateModerationTokens,
  OpenAIRateLimiter,
  OpenAIRunBudgetExceededError
} from "../src/utils/openaiRateLimiter.js";

test("estimateModerationTokens accounts for text and images", () => {
  assert.equal(estimateModerationTokens({ text: "abcd", imageCount: 0 }), 1);
  assert.equal(estimateModerationTokens({ text: "abcdefgh", imageCount: 2 }), 602);
});

test("OpenAIRateLimiter rejects requests above the per-run request budget", async () => {
  const limiter = new OpenAIRateLimiter({
    requestsPerMinute: 100,
    tokensPerMinute: 1000,
    requestsPerRun: 1,
    tokensPerRun: 1000
  });

  await limiter.reserve(1);
  await assert.rejects(() => limiter.reserve(1), OpenAIRunBudgetExceededError);
});

test("OpenAIRateLimiter rejects requests above the per-run token budget", async () => {
  const limiter = new OpenAIRateLimiter({
    requestsPerMinute: 100,
    tokensPerMinute: 1000,
    requestsPerRun: 100,
    tokensPerRun: 5
  });

  await assert.rejects(() => limiter.reserve(6), OpenAIRunBudgetExceededError);
});
