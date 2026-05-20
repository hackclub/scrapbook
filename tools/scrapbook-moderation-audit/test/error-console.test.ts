import assert from "node:assert/strict";
import test from "node:test";
import { classifyConsoleError } from "../src/utils/errorConsole.js";

test("classifyConsoleError groups actionable error messages", () => {
  assert.equal(classifyConsoleError("classify_post", "429 rate limit exceeded"), "openai_rate_limit");
  assert.equal(classifyConsoleError("classify_post", "401 invalid API key"), "openai_auth");
  assert.equal(classifyConsoleError("openai_image_moderation", "image_url could not be downloaded"), "openai_image");
  assert.equal(classifyConsoleError("classify_post", "Prisma connection timeout"), "database");
  assert.equal(classifyConsoleError("classify_post", "something strange"), "unknown");
});
