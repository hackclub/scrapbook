import { createHash } from "node:crypto";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from "./prisma.js";
import s3 from "./s3.js";
import {
  findModerationMatches,
  moderationRulesConfigured,
} from "./automod-rules.js";

const SCAN_INTERVAL_MS = 30 * 60 * 1000;
const REPORT_SCAN_INTERVAL_MS = 15 * 1000;
const SCAN_STATE_ID = "scrapbook-posts";
const SCAN_PAGE_SIZE = 200;
const MAX_POST_TEXT_LENGTH = 2_800;

const updateLocks = new Map();
const botAuthorCache = new Map();

const hashText = (text) =>
  createHash("sha256")
    .update(text || "", "utf8")
    .digest("hex");

const isBotAuthor = async (client, slackId) => {
  if (!slackId || !client?.users?.info) return false;
  if (!botAuthorCache.has(slackId)) {
    botAuthorCache.set(
      slackId,
      client.users
        .info({ user: slackId })
        .then((result) => result?.user?.is_bot === true)
        .catch((error) => {
          console.warn(
            `Could not check whether ${slackId} is a bot:`,
            error.message,
          );
          return false;
        }),
    );
  }
  return botAuthorCache.get(slackId);
};

const getConfiguredModeratorIds = () => new Set(parseModeratorIds());

const postEphemeralNotice = async (client, channel, user, text) => {
  if (!channel || !user) return;
  try {
    await client.chat.postEphemeral({ channel, user, text });
  } catch (error) {
    console.error("Could not send Scrapbook moderation notice:", error);
  }
};

const finishReviewMessage = async (client, review, text) => {
  if (!review?.reportChannel || !review.reportMessageTs) return;
  await client.chat.update({
    channel: review.reportChannel,
    ts: review.reportMessageTs,
    text,
    blocks: [
      {
        type: "section",
        text: { type: "plain_text", text },
      },
    ],
  });
};

const isAuthorizedModerator = (userId) =>
  Boolean(userId && getConfiguredModeratorIds().has(userId));

const parseActionValue = (value) => {
  try {
    const parsed = JSON.parse(value || "{}");
    if (typeof parsed.id !== "string" || typeof parsed.hash !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
};

const getReviewAndUpdate = async (reviewId, contentHash) => {
  const review = await prisma.moderationReview.findUnique({
    where: { id: reviewId },
  });
  if (
    !review ||
    review.contentHash !== contentHash ||
    review.status !== "pending"
  ) {
    return {
      error: "This review is no longer pending or its post has changed.",
    };
  }

  const update = await prisma.updates.findUnique({
    where: { id: review.updateId },
    select: {
      id: true,
      text: true,
      accountsID: true,
      accountsSlackID: true,
      channel: true,
      messageTimestamp: true,
      attachments: true,
      Accounts: { select: { slackID: true } },
      SlackAccounts: { select: { slackID: true } },
    },
  });
  if (!update || hashText(update.text) !== contentHash) {
    return {
      error: "The post changed or was deleted. Scan it again before reviewing.",
    };
  }

  return { review, update };
};

const claimReview = async (review, reviewerId) => {
  const result = await prisma.moderationReview.updateMany({
    where: {
      id: review.id,
      contentHash: review.contentHash,
      status: "pending",
    },
    data: { status: "processing", reviewedBy: reviewerId },
  });
  return result?.count === 1;
};

const releaseReviewClaim = async (reviewId) => {
  await prisma.moderationReview.updateMany({
    where: { id: reviewId, status: "processing" },
    data: { status: "pending", reviewedBy: null },
  });
};

const ownedUploadKey = (value, accountId) => {
  if (!accountId || typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const allowedHosts = new Set([
      "scrapbook-into-the-redwoods.s3.amazonaws.com",
      "scrapbook-into-the-redwoods.s3.us-east-1.amazonaws.com",
    ]);
    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname))
      return null;
    const key = decodeURIComponent(url.pathname.slice(1));
    return key.startsWith(`web/${accountId}/`) && !key.split("/").includes("..")
      ? key
      : null;
  } catch {
    return null;
  }
};

const deletePostAndOwnedUploads = async (update) => {
  const removed = await prisma.updates.deleteMany({
    where: { id: update.id, text: update.text },
  });
  if (removed?.count !== 1) {
    throw new Error(
      "The post changed before it could be removed. Review the updated post.",
    );
  }

  for (const attachment of update.attachments || []) {
    const key = ownedUploadKey(attachment, update.accountsID);
    if (!key) continue;
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: "scrapbook-into-the-redwoods",
          Key: key,
        }),
      );
    } catch (error) {
      console.error("Could not remove a rejected post's owned upload:", error);
    }
  }
};

const withUpdateLock = async (updateId, operation) => {
  const previous = updateLocks.get(updateId) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  updateLocks.set(updateId, current);
  await previous;

  try {
    return await operation();
  } finally {
    release();
    if (updateLocks.get(updateId) === current) updateLocks.delete(updateId);
  }
};

export const processUpdateForModeration = (update, client) =>
  withUpdateLock(update.id, async () => {
    const contentHash = hashText(update.text);
    const matches = await findModerationMatches(update.text || "");
    if (matches.length && (await isBotAuthor(client, update.accountsSlackID)))
      return null;
    const flaggedTerms = [...new Set(matches.map(({ word }) => word))];
    const flaggedCategories = [
      ...new Set(matches.map(({ categoryKey }) => categoryKey).filter(Boolean)),
    ];
    let review = await prisma.moderationReview.findUnique({
      where: { updateId: update.id },
    });

    if (!review) {
      if (!flaggedTerms.length) return null;

      await prisma.moderationReview.createMany({
        data: [
          {
            updateId: update.id,
            contentHash,
            flaggedTerms,
            flaggedCategories,
          },
        ],
        skipDuplicates: true,
      });
      review = await prisma.moderationReview.findUnique({
        where: { updateId: update.id },
      });
      if (!review)
        throw new Error(`Could not save moderation review for ${update.id}`);
      return review;
    }

    if (review.contentHash === contentHash) return review;
    if (review.status === "processing") return review;

    if (!flaggedTerms.length) {
      if (review.status === "pending") {
        return prisma.moderationReview.update({
          where: { id: review.id },
          data: {
            contentHash,
            flaggedTerms: [],
            flaggedCategories: [],
            status: "superseded",
            reviewedAt: new Date(),
          },
        });
      }
      return review;
    }

    return prisma.moderationReview.update({
      where: { id: review.id },
      data: {
        contentHash,
        flaggedTerms,
        flaggedCategories,
        status: "pending",
        reportChannel: null,
        reportMessageTs: null,
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });
  });

const parseModeratorIds = () =>
  (process.env.SCRAPBOOK_MODERATOR_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const fetchUpdateWithAuthor = (updateId) =>
  prisma.updates.findUnique({
    where: { id: updateId },
    select: {
      id: true,
      text: true,
      postTime: true,
      accountsID: true,
      accountsSlackID: true,
      messageTimestamp: true,
      channel: true,
      Accounts: { select: { username: true, slackID: true } },
      SlackAccounts: { select: { username: true, slackID: true } },
    },
  });

const getPostReports = (updateId) =>
  prisma.scrapbookPostReport.findMany({
    where: { updateId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, reporterUsername: true },
  });

const markPostReportsNotified = (reports) => {
  const ids = reports.map(({ id }) => id);
  if (!ids.length) return Promise.resolve();
  return prisma.scrapbookPostReport.updateMany({
    where: { id: { in: ids }, notifiedAt: null },
    data: { notifiedAt: new Date() },
  });
};

const buildModerationBlocks = (review, update, reporters = []) => {
  const author =
    update.Accounts?.username || update.SlackAccounts?.username || "Unknown";
  const postText = (update.text || "").slice(0, MAX_POST_TEXT_LENGTH);
  const truncated = (update.text || "").length > MAX_POST_TEXT_LENGTH;
  const authorLine = update.accountsSlackID
    ? `Author: ${author} (Slack ID ${update.accountsSlackID})`
    : `Author: ${author}`;
  const actions = [
    {
      type: "button",
      action_id: "scrapbook_moderation_accept",
      text: { type: "plain_text", text: "Not harmful, accept" },
      style: "primary",
      value: JSON.stringify({ id: review.id, hash: review.contentHash }),
    },
    {
      type: "button",
      action_id: "scrapbook_moderation_reject",
      text: { type: "plain_text", text: "Reject" },
      style: "danger",
      value: JSON.stringify({ id: review.id, hash: review.contentHash }),
    },
  ];

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "Potentially Harmful content" },
    },
    {
      type: "section",
      text: {
        type: "plain_text",
        text: postText
          ? `${postText}${truncated ? "…" : ""}`
          : "(This post has no text.)",
      },
    },
    {
      type: "context",
      elements: [
        { type: "plain_text", text: authorLine },
        {
          type: "plain_text",
          text: review.flaggedTerms.length
            ? `Nemo rule categories: ${review.flaggedCategories.join(", ") || "uncategorized"}. Matched rule(s): ${review.flaggedTerms.join(", ")}`.slice(
                0,
                1_900,
              )
            : "Reported by a Scrapbook user.",
        },
      ],
    },
  ];

  if (reporters.length) {
    const names = reporters
      .slice(0, 8)
      .map(({ reporterUsername }) => `@${reporterUsername}`);
    if (reporters.length > names.length) {
      names.push(`and ${reporters.length - names.length} more`);
    }
    blocks[2].elements.push({
      type: "plain_text",
      text: `Reported by: ${names.join(", ")}`.slice(0, 1_900),
    });
  }

  if (author !== "Unknown") {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Scrapbook" },
          url: `https://scrapbook.hackclub.com/${encodeURIComponent(author)}`,
          action_id: "scrapbook_moderation_view_post",
        },
      ],
    });
  }

  blocks.push({ type: "actions", elements: actions });
  return blocks;
};

const closeSupersededAlert = async (client, review) => {
  if (!review.reportChannel || !review.reportMessageTs) return;
  await client.chat.update({
    channel: review.reportChannel,
    ts: review.reportMessageTs,
    text: "This Scrapbook post was edited and no longer matches its previous moderation rule.",
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "This post was edited and no longer matches the previous rule. The review was closed.",
        },
      },
    ],
  });
};

const postModerationAlertUnlocked = async (client, review) => {
  if (!review?.id) return;
  review = await prisma.moderationReview.findUnique({
    where: { id: review.id },
  });
  if (!review || review.status !== "pending") return;

  if (review.reportChannel && review.reportMessageTs) return;
  const channel = process.env.SCRAPBOOK_MODERATION_CHANNEL_ID;
  const moderatorIds = parseModeratorIds();
  if (!channel || !moderatorIds.length) {
    console.warn(
      "Scrapbook AutoMod found a match but skipped its alert: set the moderation channel and moderator IDs.",
    );
    return;
  }

  const update = await fetchUpdateWithAuthor(review.updateId);
  const reports = await getPostReports(review.updateId);
  if (!update) {
    await markPostReportsNotified(reports);
    return;
  }
  const mentions = moderatorIds.map((id) => `<@${id}>`).join(" ");
  const result = await client.chat.postMessage({
    channel,
    text: `Potentially Harmful content needs review. ${mentions}`,
    blocks: buildModerationBlocks(review, update, reports),
    unfurl_links: false,
    unfurl_media: false,
  });
  if (!result?.ok || !result.ts) {
    throw new Error(
      `Slack did not confirm the moderation alert: ${result?.error || "unknown error"}`,
    );
  }

  const saved = await prisma.moderationReview.updateMany({
    where: {
      id: review.id,
      contentHash: review.contentHash,
      status: "pending",
    },
    data: { reportChannel: channel, reportMessageTs: result.ts },
  });
  if (!saved?.count) {
    await client.chat.update({
      channel,
      ts: result.ts,
      text: "This moderation candidate changed before it could be reviewed.",
      blocks: [],
    });
    await markPostReportsNotified(reports);
    return;
  }
  await markPostReportsNotified(reports);
};

export const postModerationAlert = (client, review) =>
  review?.updateId
    ? withUpdateLock(review.updateId, () =>
        postModerationAlertUnlocked(client, review),
      )
    : Promise.resolve();

const updateModerationAlertUnlocked = async (client, review) => {
  if (!review?.id) return;
  review = await prisma.moderationReview.findUnique({
    where: { id: review.id },
  });
  if (!review || review.status !== "pending") return;
  if (!review.reportChannel || !review.reportMessageTs) {
    return postModerationAlertUnlocked(client, review);
  }

  const update = await fetchUpdateWithAuthor(review.updateId);
  const reports = await getPostReports(review.updateId);
  if (!update) {
    await markPostReportsNotified(reports);
    return;
  }
  const result = await client.chat.update({
    channel: review.reportChannel,
    ts: review.reportMessageTs,
    text: "Potentially Harmful content needs review.",
    blocks: buildModerationBlocks(review, update, reports),
    unfurl_links: false,
    unfurl_media: false,
  });
  if (!result?.ok) {
    throw new Error(
      `Slack did not confirm the report update: ${result?.error || "unknown error"}`,
    );
  }
  await markPostReportsNotified(reports);
};

export const updateModerationAlert = (client, review) =>
  review?.updateId
    ? withUpdateLock(review.updateId, () =>
        updateModerationAlertUnlocked(client, review),
      )
    : Promise.resolve();

const reviewAndAlert = async (client, update) => {
  const previousReview = await prisma.moderationReview.findUnique({
    where: { updateId: update.id },
  });
  const review = await processUpdateForModeration(update, client);
  if (!review) return;
  if (review.status === "superseded") {
    await closeSupersededAlert(client, review);
    return;
  }
  if (
    previousReview?.status === "pending" &&
    previousReview.contentHash !== review.contentHash &&
    previousReview.reportChannel &&
    previousReview.reportMessageTs
  ) {
    await client.chat.update({
      channel: previousReview.reportChannel,
      ts: previousReview.reportMessageTs,
      text: "This post changed after the alert. Review the updated alert below.",
      blocks: [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "This post changed after the alert. The previous review card is closed; review the updated card below.",
          },
        },
      ],
    });
  }
  await postModerationAlert(client, review);
};

export const reviewScrapbookUpdate = async (client, updateId) => {
  const update = await fetchUpdateWithAuthor(updateId);
  if (!update) return;
  await reviewAndAlert(client, update);
};

export const registerModerationActions = (slackApp) => {
  slackApp.action(
    "scrapbook_moderation_accept",
    async ({ ack, body, action, client }) => {
      await ack();
      if (!isAuthorizedModerator(body.user?.id)) {
        await postEphemeralNotice(
          client,
          body.channel?.id,
          body.user?.id,
          `You are not on the configured Scrapbook moderator allowlist. Your Slack ID is ${body.user?.id || "unknown"}.`,
        );
        return;
      }

      const value = parseActionValue(action.value);
      if (!value) return;
      const found = await getReviewAndUpdate(value.id, value.hash);
      if (found.error) {
        await postEphemeralNotice(
          client,
          body.channel?.id,
          body.user.id,
          found.error,
        );
        return;
      }

      const accepted = await prisma.moderationReview.updateMany({
        where: { id: value.id, contentHash: value.hash, status: "pending" },
        data: {
          status: "accepted",
          reviewedBy: body.user.id,
          reviewedAt: new Date(),
        },
      });
      if (accepted?.count !== 1) {
        await postEphemeralNotice(
          client,
          body.channel?.id,
          body.user.id,
          "Another moderator already handled this review.",
        );
        return;
      }

      const review = await prisma.moderationReview.findUnique({
        where: { id: value.id },
      });
      await finishReviewMessage(
        client,
        review,
        `Accepted by <@${body.user.id}> as not harmful. The post remains on Scrapbook.`,
      );
    },
  );

  slackApp.action(
    "scrapbook_moderation_reject",
    async ({ ack, body, action, client }) => {
      await ack();
      if (!isAuthorizedModerator(body.user?.id)) {
        await postEphemeralNotice(
          client,
          body.channel?.id,
          body.user?.id,
          `You are not on the configured Scrapbook moderator allowlist. Your Slack ID is ${body.user?.id || "unknown"}.`,
        );
        return;
      }

      const value = parseActionValue(action.value);
      if (!value) return;
      const found = await getReviewAndUpdate(value.id, value.hash);
      if (found.error) {
        await postEphemeralNotice(
          client,
          body.channel?.id,
          body.user.id,
          found.error,
        );
        return;
      }

      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          callback_id: "scrapbook_moderation_reject_submit",
          private_metadata: JSON.stringify({ id: value.id, hash: value.hash }),
          title: { type: "plain_text", text: "Reject Scrapbook post" },
          submit: { type: "plain_text", text: "Reject post" },
          close: { type: "plain_text", text: "Cancel" },
          blocks: [
            {
              type: "input",
              block_id: "rejection_reason_block",
              label: {
                type: "plain_text",
                text: "Reason to send to the author",
              },
              element: {
                type: "plain_text_input",
                action_id: "rejection_reason",
                multiline: true,
                max_length: 1000,
                placeholder: {
                  type: "plain_text",
                  text: "Explain why this post is being rejected.",
                },
              },
            },
          ],
        },
      });
    },
  );

  slackApp.view(
    "scrapbook_moderation_reject_submit",
    async ({ ack, body, view, client }) => {
      const reason =
        view.state.values.rejection_reason_block.rejection_reason.value?.trim();
      if (!reason) {
        await ack({
          response_action: "errors",
          errors: {
            rejection_reason_block:
              "Enter a reason to send to the post author.",
          },
        });
        return;
      }
      await ack();

      const value = parseActionValue(view.private_metadata);
      const reviewerId = body.user?.id;
      if (!value || !isAuthorizedModerator(reviewerId)) {
        await postEphemeralNotice(
          client,
          process.env.SCRAPBOOK_MODERATION_CHANNEL_ID,
          reviewerId,
          "You are not authorized to reject Scrapbook posts.",
        );
        return;
      }

      const found = await getReviewAndUpdate(value.id, value.hash);
      if (found.error) {
        await postEphemeralNotice(
          client,
          process.env.SCRAPBOOK_MODERATION_CHANNEL_ID,
          reviewerId,
          found.error,
        );
        return;
      }

      const { review, update } = found;
      const authorSlackId =
        update.accountsSlackID ||
        update.SlackAccounts?.slackID ||
        update.Accounts?.slackID;
      if (!authorSlackId) {
        await postEphemeralNotice(
          client,
          review.reportChannel,
          reviewerId,
          "This author has no linked Slack account, so the rejection reason cannot be sent. The post was left unchanged.",
        );
        return;
      }

      if (!(await claimReview(review, reviewerId))) {
        await postEphemeralNotice(
          client,
          review.reportChannel,
          reviewerId,
          "Another moderator already handled this review.",
        );
        return;
      }

      let authorNotified = false;
      try {
        const dm = await client.conversations.open({ users: authorSlackId });
        if (!dm?.ok || !dm.channel?.id)
          throw new Error(dm?.error || "Could not open author DM");
        const sent = await client.chat.postMessage({
          channel: dm.channel.id,
          text: `A moderator rejected your Scrapbook post for this reason:\n\n${reason}`,
          mrkdwn: false,
          unfurl_links: false,
          unfurl_media: false,
        });
        if (!sent?.ok)
          throw new Error(sent?.error || "Could not send author DM");
        authorNotified = true;

        await deletePostAndOwnedUploads(update);
        let sourceMessageWarning = "";
        if (update.channel && update.messageTimestamp !== null) {
          try {
            const ts = String(update.messageTimestamp);
            const deleted = await client.chat.delete({
              token: process.env.SLACK_USER_TOKEN,
              channel: update.channel,
              ts,
            });
            if (!deleted?.ok)
              throw new Error(
                deleted?.error || "Slack did not delete the source message",
              );
          } catch (error) {
            sourceMessageWarning =
              " The Scrapbook post was removed, but its source Slack message could not be deleted; please remove it manually.";
            console.error(
              "Could not delete rejected Scrapbook source message:",
              error,
            );
          }
        }

        const savedReview = await prisma.moderationReview.update({
          where: { id: review.id },
          data: {
            status: "rejected",
            rejectionReason: reason,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
          },
        });
        if (!savedReview)
          throw new Error("The rejection decision could not be recorded.");
        const completedReview = await prisma.moderationReview.findUnique({
          where: { id: review.id },
        });
        await finishReviewMessage(
          client,
          completedReview,
          `Rejected by <@${reviewerId}>. The post was removed from Scrapbook and the author was sent the reason.${sourceMessageWarning}`,
        );
      } catch (error) {
        await releaseReviewClaim(review.id);
        await postEphemeralNotice(
          client,
          review.reportChannel,
          reviewerId,
          `${authorNotified ? "The author received the reason, but " : ""}${error.message || "The post could not be rejected."} The review remains open.`,
        );
        console.error("Scrapbook moderation rejection failed:", error);
      }
    },
  );
};

const scanPage = async (windowStart, scanThrough, cursor) => {
  const dateFilter = {
    postTime: { gte: windowStart, lte: scanThrough },
  };
  const cursorFilter = cursor
    ? {
        OR: [
          { postTime: { gt: cursor.postTime } },
          { postTime: cursor.postTime, id: { gt: cursor.id } },
        ],
      }
    : null;

  return prisma.updates.findMany({
    where: cursorFilter ? { AND: [dateFilter, cursorFilter] } : dateFilter,
    orderBy: [{ postTime: "asc" }, { id: "asc" }],
    take: SCAN_PAGE_SIZE,
    select: {
      id: true,
      postTime: true,
      text: true,
      accountsID: true,
      accountsSlackID: true,
      channel: true,
      messageTimestamp: true,
      attachments: true,
    },
  });
};

export const scanRecentScrapbookPosts = async (client) => {
  if (!moderationRulesConfigured) {
    console.warn(
      "Scrapbook AutoMod scan skipped: no flag rules are configured.",
    );
    return;
  }

  const now = Date.now();
  const scanThrough = new Date(now - 5_000);
  const state = await prisma.moderationScanState.upsert({
    where: { id: SCAN_STATE_ID },
    create: {
      id: SCAN_STATE_ID,
      lastScannedAt: new Date(now - SCAN_INTERVAL_MS),
    },
    update: {},
  });
  if (!state?.lastScannedAt)
    throw new Error("Could not load moderation scan state");

  // Re-scan one interval of overlap in case an event arrived late. Review
  // records are keyed by update ID and content hash, so unchanged posts do not
  // create duplicate alerts.
  const windowStart = new Date(
    state.lastScannedAt.getTime() - SCAN_INTERVAL_MS,
  );
  let cursor = null;
  let scanned = 0;

  while (true) {
    const updates = await scanPage(windowStart, scanThrough, cursor);
    if (!Array.isArray(updates))
      throw new Error("Could not read Scrapbook posts for moderation");
    if (!updates.length) break;

    for (const update of updates) {
      await reviewAndAlert(client, update);
      cursor = { postTime: update.postTime, id: update.id };
      scanned += 1;
    }

    if (updates.length < SCAN_PAGE_SIZE) break;
  }

  const savedState = await prisma.moderationScanState.update({
    where: { id: SCAN_STATE_ID },
    data: { lastScannedAt: scanThrough },
  });
  if (!savedState) throw new Error("Could not save moderation scan checkpoint");
  console.log(`Scrapbook AutoMod scanned ${scanned} post(s).`);
};

let scanTimer;
let scanInProgress = false;
let reportScanTimer;
let reportScanInProgress = false;

export const scanPendingScrapbookReports = async (client) => {
  if (
    !process.env.SCRAPBOOK_MODERATION_CHANNEL_ID ||
    !parseModeratorIds().length
  ) {
    return;
  }

  const pendingReports = await prisma.scrapbookPostReport.findMany({
    where: { notifiedAt: null },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: SCAN_PAGE_SIZE,
    select: { id: true, updateId: true },
  });
  const updateIds = [
    ...new Set(pendingReports.map(({ updateId }) => updateId)),
  ];

  for (const updateId of updateIds) {
    const review = await prisma.moderationReview.findUnique({
      where: { updateId },
    });
    if (!review || review.status !== "pending") {
      await markPostReportsNotified(
        pendingReports.filter((report) => report.updateId === updateId),
      );
      continue;
    }
    if (review.reportChannel && review.reportMessageTs) {
      await updateModerationAlert(client, review);
    } else {
      await postModerationAlert(client, review);
    }
  }
};

export const startModerationScanner = (client) => {
  if (scanTimer && reportScanTimer) return;

  const runScan = async () => {
    if (scanInProgress) return;
    scanInProgress = true;
    try {
      await scanRecentScrapbookPosts(client);
    } catch (error) {
      console.error("Scrapbook AutoMod scan failed:", error);
    } finally {
      scanInProgress = false;
    }
  };

  void runScan();
  if (!scanTimer) {
    scanTimer = setInterval(runScan, SCAN_INTERVAL_MS);
    scanTimer.unref?.();
  }

  const runReportScan = async () => {
    if (reportScanInProgress) return;
    reportScanInProgress = true;
    try {
      await scanPendingScrapbookReports(client);
    } catch (error) {
      console.error("Scrapbook post report scan failed:", error);
    } finally {
      reportScanInProgress = false;
    }
  };

  void runReportScan();
  if (!reportScanTimer) {
    reportScanTimer = setInterval(runReportScan, REPORT_SCAN_INTERVAL_MS);
    reportScanTimer.unref?.();
  }
};
