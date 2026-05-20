import assert from "node:assert/strict";
import test from "node:test";
import { ErrorReportBuilder } from "../src/output/errorReport.js";
import type { AuditUpdate, AuditUser } from "../src/types.js";

const user: AuditUser = {
  id: "user_1",
  username: "ada",
  name: "Ada",
  email: "ada@example.com",
  avatar: "https://example.com/avatar.png",
  image: null,
  slackID: "U123",
  createdAt: new Date("2024-01-01T00:00:00.000Z")
};

const update: AuditUpdate = {
  id: "update_1",
  postTime: new Date("2026-01-01T00:00:00.000Z"),
  text: "Full post body that needs manual review",
  attachments: ["https://example.com/image.png"],
  muxPlaybackIDs: ["mux_123"],
  accountsID: "user_1",
  accountsSlackID: "U123",
  messageTimestamp: null,
  channel: null,
  Accounts: user,
  SlackAccounts: null
};

test("ErrorReportBuilder keeps full post content and error details", () => {
  const builder = new ErrorReportBuilder();
  builder.addErroredPost({
    update,
    user,
    stage: "openai_image_moderation",
    error: "Image URL could not be downloaded",
    metadata: { recoveredWithTextOnlyRetry: true }
  });

  const report = builder.build();

  assert.equal(report.summary.postsWithErrors, 1);
  assert.equal(report.summary.totalErrors, 1);
  assert.equal(report.errors[0].text, "Full post body that needs manual review");
  assert.equal(report.errors[0].stage, "openai_image_moderation");
  assert.equal(report.errors[0].postUrl, "https://scrapbook.hackclub.com/ada#update_1");
  assert.deepEqual(report.errors[0].attachments, ["https://example.com/image.png"]);
  assert.deepEqual(report.errors[0].metadata, { recoveredWithTextOnlyRetry: true });
});
