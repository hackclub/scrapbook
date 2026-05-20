import OpenAI from "openai";
import type { AuditConfig } from "../config.js";
import { withRetry } from "../utils/backoff.js";
import { sleep } from "../utils/sleep.js";
import { truncateForModeration } from "../utils/text.js";
import { estimateModerationTokens, type OpenAIRateLimiter } from "../utils/openaiRateLimiter.js";

export type OpenAIModerationClient = Pick<OpenAI["moderations"], "create">;

export function createOpenAIClient(config: AuditConfig): OpenAI {
  return new OpenAI({ apiKey: config.openaiApiKey });
}

export async function moderatePostWithOpenAI(input: {
  client: OpenAIModerationClient;
  model: string;
  text: string;
  imageUrls: string[];
  sleepMs: number;
  rateLimiter?: OpenAIRateLimiter;
}): Promise<unknown> {
  const moderationInput: Array<Record<string, unknown>> = [];

  if (input.text.trim()) {
    moderationInput.push({ type: "text", text: truncateForModeration(input.text) });
  }

  for (const url of input.imageUrls) {
    moderationInput.push({
      type: "image_url",
      image_url: { url }
    });
  }

  if (moderationInput.length === 0) return null;
  await input.rateLimiter?.reserve(
    estimateModerationTokens({
      text: input.text,
      imageCount: input.imageUrls.length
    })
  );
  if (input.sleepMs > 0) await sleep(input.sleepMs);

  return withRetry(() =>
    input.client.create({
      model: input.model,
      input: moderationInput as never
    })
  );
}

export async function moderateTextBatchWithOpenAI(input: {
  client: OpenAIModerationClient;
  model: string;
  texts: string[];
  sleepMs: number;
  rateLimiter?: OpenAIRateLimiter;
}): Promise<unknown> {
  const texts = input.texts.map(truncateForModeration).filter((text) => text.trim().length > 0);
  if (texts.length === 0) return null;

  await input.rateLimiter?.reserve(
    texts.reduce(
      (sum, text) =>
        sum +
        estimateModerationTokens({
          text,
          imageCount: 0
        }),
      0
    )
  );
  if (input.sleepMs > 0) await sleep(input.sleepMs);

  return withRetry(() =>
    input.client.create({
      model: input.model,
      input: texts as never
    })
  );
}
