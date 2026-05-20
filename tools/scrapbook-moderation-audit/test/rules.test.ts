import assert from "node:assert/strict";
import test from "node:test";
import { detectAds } from "../src/rules/ads.js";
import { detectTeenSafetyTerms } from "../src/rules/teenSafety.js";
import { detectSuspiciousLinks } from "../src/rules/links.js";
import { extractUrls, extractImageUrlsFromAttachments, isImageUrl } from "../src/utils/urls.js";
import { shouldCallOpenAI } from "../src/rules/trust.js";
import type { AuditUser, Finding } from "../src/types.js";

const user: AuditUser = {
  id: "user_1",
  username: "ada",
  name: "Ada",
  email: "ada@example.com",
  avatar: null,
  image: null,
  slackID: "U123",
  createdAt: new Date("2020-01-01T00:00:00.000Z")
};

test("detectAds returns structured findings for spammy commercial terms", () => {
  const findings = detectAds("Join my crypto signals telegram channel for guaranteed profit");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].source, "ad_heuristic");
  assert.equal(findings[0].severity, "high");
  assert.equal(findings[0].label, "crypto_or_trading_promo");
});

test("detectTeenSafetyTerms catches teen-safety prefilter terms", () => {
  const findings = detectTeenSafetyTerms("This demo includes a graphic violence warning");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].source, "teen_safety_rule");
  assert.equal(findings[0].label, "possible_graphic_violence");
});

test("extractUrls parses plain and Slack-style URLs", () => {
  const links = extractUrls("Plain https://example.com/a. Slack <https://hackclub.com|Hack Club>");
  assert.deepEqual(
    links.map((link) => link.url).sort(),
    ["https://example.com/a", "https://hackclub.com"].sort()
  );
});

test("detectSuspiciousLinks flags shorteners, invites, and density", () => {
  const findings = detectSuspiciousLinks(
    "https://bit.ly/x https://t.me/foo https://example.com/a https://example.com/b"
  );
  assert.ok(findings.some((finding) => finding.label === "url_shortener"));
  assert.ok(findings.some((finding) => finding.label === "messaging_invite_link"));
  assert.ok(findings.some((finding) => finding.label === "high_link_density"));
});

test("image URL filtering keeps image attachments and skips videos/audio", () => {
  assert.equal(isImageUrl("https://example.com/photo.png?width=100"), true);
  assert.equal(isImageUrl("https://example.com/video.mp4"), false);
  assert.deepEqual(extractImageUrlsFromAttachments([
    "https://example.com/photo.png",
    "https://example.com/video.mp4",
    "https://example.com/other.webp"
  ], 1), ["https://example.com/photo.png"]);
});

test("trusted low-risk authors can skip OpenAI", () => {
  const localFindings: Finding[] = [];
  assert.equal(
    shouldCallOpenAI({
      user,
      knownGoodPostCount: 20,
      trustedGoodPostThreshold: 15,
      newAccountYears: 2,
      hasImages: false,
      text: "A normal project update",
      localFindings,
      suspiciousTextShape: false
    }),
    false
  );
});

test("trusted authors are still moderated when a post has links or findings", () => {
  assert.equal(
    shouldCallOpenAI({
      user,
      knownGoodPostCount: 20,
      trustedGoodPostThreshold: 15,
      newAccountYears: 2,
      hasImages: false,
      text: "A project update https://example.com",
      localFindings: [],
      suspiciousTextShape: false
    }),
    true
  );
});
