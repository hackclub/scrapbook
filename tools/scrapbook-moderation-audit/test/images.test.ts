import assert from "node:assert/strict";
import test from "node:test";
import { imageBytesToDataUrl } from "../src/moderation/images.js";

test("imageBytesToDataUrl converts bytes into an OpenAI-compatible data URL", () => {
  const dataUrl = imageBytesToDataUrl(Buffer.from("hello"), "image/png");
  assert.equal(dataUrl, "data:image/png;base64,aGVsbG8=");
});

test("imageBytesToDataUrl rejects unsupported image media types", () => {
  assert.throws(() => imageBytesToDataUrl(Buffer.from("hello"), "image/svg+xml"), /Unsupported image media type/);
});
