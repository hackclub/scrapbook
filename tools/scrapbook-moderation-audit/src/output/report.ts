import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditConfig } from "../config.js";
import type {
  AuditUpdate,
  AuditUser,
  Finding,
  ModerationReport,
  ReportPost,
  ReportPriority,
  ReportUser,
  Summary
} from "../types.js";
import { avatarForUser, postUrlForUser, profileUrlForUser } from "../db/users.js";
import { contentPreview } from "../utils/text.js";

export class ReportBuilder {
  private readonly users = new Map<string, ReportUser>();

  addFlaggedPost(input: {
    user: AuditUser;
    update: AuditUpdate;
    knownGoodPostCount: number;
    priority: ReportPriority;
    text: string;
    imageUrls: string[];
    reasons: Finding[];
    rawModeration?: unknown;
    includeFullContent: boolean;
  }) {
    const key = input.user.id || input.user.slackID || input.user.username || "unknown";
    const existing = this.users.get(key);
    const reportUser =
      existing ??
      ({
        user: {
          id: input.user.id,
          username: input.user.username,
          name: input.user.name,
          email: input.user.email,
          createdAt: input.user.createdAt?.toISOString() ?? null,
          avatar: avatarForUser(input.user),
          profileUrl: profileUrlForUser(input.user),
          knownGoodPostCount: input.knownGoodPostCount
        },
        priority: input.priority,
        flaggedPosts: []
      } satisfies ReportUser);

    if (existing && existing.priority === "regular" && input.priority !== "regular") {
      existing.priority = input.priority;
    }

    const post: ReportPost = {
      postId: input.update.id,
      postUrl: postUrlForUser(input.user, input.update.id),
      createdAt: input.update.postTime?.toISOString() ?? new Date(0).toISOString(),
      contentPreview: contentPreview(input.text, input.includeFullContent),
      imageUrls: input.imageUrls,
      reasons: input.reasons,
      ...(input.rawModeration === undefined ? {} : { rawModeration: input.rawModeration })
    };

    reportUser.flaggedPosts.push(post);
    this.users.set(key, reportUser);
  }

  build(config: AuditConfig, summary: Summary): ModerationReport {
    const users = [...this.users.values()].sort((a, b) => {
      const highSeverity = (user: ReportUser) =>
        user.flaggedPosts.some((post) => post.reasons.some((reason) => reason.severity === "high")) ? 0 : 1;
      return highSeverity(a) - highSeverity(b) || b.flaggedPosts.length - a.flaggedPosts.length;
    });

    return {
      generatedAt: new Date().toISOString(),
      config: {
        model: config.moderationModel,
        trustedGoodPostThreshold: config.trustedGoodPostThreshold,
        newAccountYears: config.newAccountYears,
        maxImagesPerPost: config.maxImagesPerPost,
        maxImageBytes: config.maxImageBytes,
        includeRawOpenAI: config.includeRawOpenAI
      },
      summary: {
        ...summary,
        usersFlagged: users.length,
        postsFlagged: users.reduce((count, user) => count + user.flaggedPosts.length, 0)
      },
      users
    };
  }
}

export async function writeReport(file: string, report: ModerationReport): Promise<void> {
  await mkdir(path.dirname(path.resolve(file)), { recursive: true });
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
