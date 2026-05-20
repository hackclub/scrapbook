import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditUpdate, AuditUser, ModerationErrorReport } from "../types.js";
import { avatarForUser, postUrlForUser, profileUrlForUser } from "../db/users.js";
import { normalizeText } from "../utils/text.js";

export class ErrorReportBuilder {
  private readonly errors: ModerationErrorReport["errors"] = [];

  addErroredPost(input: {
    update: AuditUpdate;
    user: AuditUser;
    stage: string;
    error: string;
    text?: string;
    metadata?: Record<string, unknown>;
  }): void {
    this.errors.push({
      postId: input.update.id,
      postUrl: postUrlForUser(input.user, input.update.id),
      createdAt: input.update.postTime?.toISOString() ?? null,
      user: {
        id: input.user.id,
        username: input.user.username,
        name: input.user.name,
        email: input.user.email,
        createdAt: input.user.createdAt?.toISOString() ?? null,
        avatar: avatarForUser(input.user),
        profileUrl: profileUrlForUser(input.user)
      },
      text: input.text ?? normalizeText(input.update.text),
      attachments: input.update.attachments ?? [],
      muxPlaybackIDs: input.update.muxPlaybackIDs ?? [],
      stage: input.stage,
      error: input.error,
      occurredAt: new Date().toISOString(),
      ...(input.metadata ? { metadata: input.metadata } : {})
    });
  }

  build(): ModerationErrorReport {
    const uniquePostIds = new Set(this.errors.map((entry) => entry.postId));
    return {
      generatedAt: new Date().toISOString(),
      summary: {
        postsWithErrors: uniquePostIds.size,
        totalErrors: this.errors.length
      },
      errors: this.errors
    };
  }
}

export async function writeErrorReport(file: string, report: ModerationErrorReport): Promise<void> {
  await mkdir(path.dirname(path.resolve(file)), { recursive: true });
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
