import { pathToFileURL } from "node:url";
import { loadConfig } from "./config.js";
import { createPrismaClient } from "./prisma.js";
import { countUpdatesForAudit, findUpdatesBatch } from "./db/posts.js";
import { countKnownGoodPosts } from "./db/trust.js";
import { resolveAuthor, userCacheKey } from "./db/users.js";
import { classifyPost } from "./moderation/classifyPost.js";
import { createOpenAIClient, moderateTextBatchWithOpenAI, type OpenAIModerationClient } from "./moderation/openai.js";
import { normalizeModerationFindings } from "./moderation/normalize.js";
import { mapWithConcurrency } from "./utils/concurrency.js";
import { describeError } from "./utils/text.js";
import { emptyCheckpoint, loadCheckpoint, saveCheckpoint, checkpointAfterBatch } from "./output/checkpoint.js";
import { JsonlErrorLogger } from "./output/jsonl.js";
import { ReportBuilder, writeReport } from "./output/report.js";
import { ErrorReportBuilder, writeErrorReport } from "./output/errorReport.js";
import { ProgressLogger } from "./utils/progress.js";
import {
  classifyConsoleError,
  ErrorConsoleReporter,
  shouldAbortOnErrorType,
  type ConsoleErrorEvent
} from "./utils/errorConsole.js";
import {
  estimateModerationTokens,
  OpenAIRateLimiter,
  OpenAIRunBudgetExceededError
} from "./utils/openaiRateLimiter.js";
import type { Checkpoint, Summary } from "./types.js";
import type { AuditConfig } from "./config.js";
import type { AuditUpdate, AuditUser, Finding, ReportPriority } from "./types.js";

class ScanAbortError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanAbortError";
  }
}

type PendingTextModeration = {
  update: AuditUpdate;
  user: AuditUser;
  knownGoodPostCount: number;
  text: string;
  imageUrls: string[];
  localReasons: Finding[];
  priority: ReportPriority;
};

function rawModerationResult(response: unknown, index: number): unknown {
  const moderation = response as { id?: string; model?: string; results?: unknown[] };
  return {
    id: moderation?.id,
    model: moderation?.model,
    result: moderation?.results?.[index]
  };
}

function buildTextModerationGroups(items: PendingTextModeration[], config: AuditConfig): PendingTextModeration[][] {
  const groups: PendingTextModeration[][] = [];
  let current: PendingTextModeration[] = [];
  let currentTokens = 0;

  for (const item of items) {
    const itemTokens = estimateModerationTokens({ text: item.text, imageCount: 0 });
    const wouldExceedCount = current.length >= config.openaiTextBatchSize;
    const wouldExceedTokens =
      current.length > 0 && currentTokens + itemTokens > config.openaiTextBatchTokenLimit;

    if (wouldExceedCount || wouldExceedTokens) {
      groups.push(current);
      current = [];
      currentTokens = 0;
    }

    current.push(item);
    currentTokens += itemTokens;
  }

  if (current.length > 0) groups.push(current);
  return groups;
}

export const buildTextModerationGroupsForTest = buildTextModerationGroups;

async function moderateTextGroups(input: {
  groups: PendingTextModeration[][];
  config: AuditConfig;
  openai: OpenAIModerationClient;
  rateLimiter?: OpenAIRateLimiter;
  errorLogger: JsonlErrorLogger;
  errorReport: ErrorReportBuilder;
  report: ReportBuilder;
  includeFullContent: boolean;
  includeRawOpenAI: boolean;
  noteErrorEvent: (event: ConsoleErrorEvent) => void;
}): Promise<{ postsModerated: number; errors: number; flaggedPosts: number }> {
  let postsModerated = 0;
  let errors = 0;
  let flaggedPosts = 0;

  for (const group of input.groups) {
    try {
      const response = await moderateTextBatchWithOpenAI({
        client: input.openai,
        model: input.config.moderationModel,
        texts: group.map((item) => item.text),
        sleepMs: input.config.sleepMs,
        rateLimiter: input.rateLimiter
      });
      postsModerated += group.length;

      for (let index = 0; index < group.length; index += 1) {
        const item = group[index];
        const openAIFindings = normalizeModerationFindings(response, index);
        const reasons = [...item.localReasons, ...openAIFindings];
        if (reasons.length === 0) continue;

        flaggedPosts += 1;
        input.report.addFlaggedPost({
          user: item.user,
          update: item.update,
          knownGoodPostCount: item.knownGoodPostCount,
          priority: item.priority,
          text: item.text,
          imageUrls: item.imageUrls,
          reasons,
          rawModeration: input.includeRawOpenAI ? rawModerationResult(response, index) : undefined,
          includeFullContent: input.includeFullContent
        });
      }
    } catch (error) {
      const errorMessage = describeError(error);
      errors += group.length;

      for (const item of group) {
        await input.errorLogger.write({
          postId: item.update.id,
          userId: item.user.id,
          stage: "openai_text_batch_moderation",
          error: errorMessage,
          metadata: { batchSize: group.length }
        });
        input.errorReport.addErroredPost({
          update: item.update,
          user: item.user,
          text: item.text,
          stage: "openai_text_batch_moderation",
          error: errorMessage,
          metadata: { batchSize: group.length }
        });
      }

      input.noteErrorEvent({
        type: classifyConsoleError("openai_text_batch_moderation", errorMessage),
        stage: "openai_text_batch_moderation",
        message: errorMessage,
        postId: group[0]?.update.id,
        recoverable: false
      });

      if (error instanceof OpenAIRunBudgetExceededError) {
        throw new ScanAbortError(error.message);
      }
    }
  }

  return { postsModerated, errors, flaggedPosts };
}

async function main() {
  const config = loadConfig();
  const prisma = createPrismaClient();
  const openai = config.dryRun ? undefined : createOpenAIClient(config).moderations;
  const rateLimiter = config.dryRun
    ? undefined
    : new OpenAIRateLimiter({
        requestsPerMinute: config.openaiRequestsPerMinute,
        tokensPerMinute: config.openaiTokensPerMinute,
        requestsPerRun: config.openaiRequestsPerRun,
        tokensPerRun: config.openaiTokensPerRun
      });
  const errorLogger = new JsonlErrorLogger(config.errorLogFile);
  const report = new ReportBuilder();
  const errorReport = new ErrorReportBuilder();
  const trustCache = new Map<string, number>();
  let flaggedPosts = 0;
  let consecutiveInfraErrors = 0;
  let abortReason: string | null = null;

  let checkpoint = (await loadCheckpoint(config.checkpointFile, config.resume)) ?? emptyCheckpoint();
  const startingPostsScanned = checkpoint.postsScanned;
  const startingPostsModerated = checkpoint.postsModerated;
  const startingPostsSkippedTrusted = checkpoint.postsSkippedTrusted;
  const startingErrors = checkpoint.errors;
  const counters: Pick<Checkpoint, "postsScanned" | "postsModerated" | "postsSkippedTrusted" | "errors"> = {
    postsScanned: checkpoint.postsScanned,
    postsModerated: checkpoint.postsModerated,
    postsSkippedTrusted: checkpoint.postsSkippedTrusted,
    errors: checkpoint.errors
  };

  try {
    const remainingUpdates = await countUpdatesForAudit(prisma, config, checkpoint);
    const progressTotal = Math.min(remainingUpdates, config.limit ?? remainingUpdates);
    const progress = new ProgressLogger(progressTotal);
    const errorConsole = new ErrorConsoleReporter(progress);
    const noteErrorEvent = (event: ConsoleErrorEvent) => {
      errorConsole.record(event);

      if (event.recoverable || !shouldAbortOnErrorType(event.type)) {
        return;
      }

      consecutiveInfraErrors += 1;
      if (consecutiveInfraErrors >= config.maxConsecutiveInfraErrors) {
        throw new ScanAbortError(
          `Aborting after ${consecutiveInfraErrors} consecutive ${event.type} errors. ` +
            "Fix the cause, then rerun with --resume so already-checkpointed batches are not repeated."
        );
      }
    };

    progress.start(
      `Starting ${config.dryRun ? "dry-run" : "real"} audit: ${progressTotal} post${progressTotal === 1 ? "" : "s"} to scan` +
        ` | batch ${config.batchSize} | concurrency ${config.concurrency}`
    );
    if (!config.dryRun && rateLimiter) {
      progress.info(
        `OpenAI limits: ${config.openaiRequestsPerMinute} RPM, ${config.openaiTokensPerMinute} TPM, ` +
          `${config.openaiRequestsPerRun} requests/run, ${config.openaiTokensPerRun} tokens/run`
      );
    }
    if (config.resume && checkpoint.lastPostTime && checkpoint.lastUpdateId) {
      progress.info(`Resuming after ${checkpoint.lastPostTime} / ${checkpoint.lastUpdateId}`);
    }
    progress.update({
      scanned: 0,
      moderated: 0,
      skippedTrusted: 0,
      flaggedPosts,
      errors: 0
    }, true);

    while (true) {
      const remaining = config.limit ? config.limit - (counters.postsScanned - startingPostsScanned) : undefined;
      if (remaining !== undefined && remaining <= 0) break;

      const take = Math.min(config.batchSize, remaining ?? config.batchSize);
      const updates = await findUpdatesBatch(prisma, config, checkpoint, take);
      if (updates.length === 0) break;

      try {
        const pendingTextModeration: PendingTextModeration[] = [];
        const pendingImageModeration: Array<{
          update: AuditUpdate;
          user: AuditUser;
          knownGoodPostCount: number;
        }> = [];

        await mapWithConcurrency(updates, config.concurrency, async (update) => {
          if (abortReason) return;
          counters.postsScanned += 1;
          const user = resolveAuthor(update);
          if (!user) return;

          try {
            const cacheKey = userCacheKey(user);
            let knownGoodPostCount = trustCache.get(cacheKey);
            if (knownGoodPostCount === undefined) {
              knownGoodPostCount = await countKnownGoodPosts(prisma, user);
              trustCache.set(cacheKey, knownGoodPostCount);
            }

            const result = await classifyPost({
              update,
              user,
              knownGoodPostCount,
              config,
              openai,
              rateLimiter,
              errorLogger,
              errorReport,
              skipOpenAI: !config.dryRun
            });

            if (result.skippedTrusted) counters.postsSkippedTrusted += 1;

            if (config.dryRun) {
              if (result.reasons.length > 0) {
                flaggedPosts += 1;
                report.addFlaggedPost({
                  user,
                  update,
                  knownGoodPostCount,
                  priority: result.priority,
                  text: result.text,
                  imageUrls: result.imageUrls,
                  reasons: result.reasons,
                  rawModeration: result.rawModeration,
                  includeFullContent: config.includeFullContent
                });
              }
              return;
            }

            if (!result.shouldModerate) {
              if (result.reasons.length > 0) {
                flaggedPosts += 1;
                report.addFlaggedPost({
                  user,
                  update,
                  knownGoodPostCount,
                  priority: result.priority,
                  text: result.text,
                  imageUrls: result.imageUrls,
                  reasons: result.reasons,
                  includeFullContent: config.includeFullContent
                });
              }
              return;
            }

            if (result.imageUrls.length > 0) {
              pendingImageModeration.push({ update, user, knownGoodPostCount });
            } else {
              pendingTextModeration.push({
                update,
                user,
                knownGoodPostCount,
                text: result.text,
                imageUrls: result.imageUrls,
                localReasons: result.reasons,
                priority: result.priority
              });
            }
          } catch (error) {
            const errorMessage = describeError(error);
            counters.errors += 1;
            await errorLogger.write({
              postId: update.id,
              userId: user.id,
              stage: "local_classification",
              error: errorMessage
            });
            errorReport.addErroredPost({
              update,
              user,
              stage: "local_classification",
              error: errorMessage
            });
            noteErrorEvent({
              type: classifyConsoleError("local_classification", errorMessage),
              stage: "local_classification",
              message: errorMessage,
              postId: update.id,
              recoverable: false
            });
          } finally {
            progress.update({
              scanned: counters.postsScanned - startingPostsScanned,
              moderated: counters.postsModerated - startingPostsModerated,
              skippedTrusted: counters.postsSkippedTrusted - startingPostsSkippedTrusted,
              flaggedPosts,
              errors: counters.errors - startingErrors
            });
          }
        });

        if (!config.dryRun && openai) {
          const textGroups = buildTextModerationGroups(pendingTextModeration, config);
          const textBatchResult = await moderateTextGroups({
            groups: textGroups,
            config,
            openai,
            rateLimiter,
            errorLogger,
            errorReport,
            report,
            includeFullContent: config.includeFullContent,
            includeRawOpenAI: config.includeRawOpenAI,
            noteErrorEvent
          });
          counters.postsModerated += textBatchResult.postsModerated;
          counters.errors += textBatchResult.errors;
          flaggedPosts += textBatchResult.flaggedPosts;
          if (textBatchResult.errors === 0) {
            consecutiveInfraErrors = 0;
          }

          for (const item of pendingImageModeration) {
            if (abortReason) break;
            try {
              const result = await classifyPost({
                update: item.update,
                user: item.user,
                knownGoodPostCount: item.knownGoodPostCount,
                config,
                openai,
                rateLimiter,
                errorLogger,
                errorReport
              });

              counters.errors += result.errorCount;
              for (const event of result.errorEvents) {
                noteErrorEvent(event);
              }
              if (result.shouldModerate) counters.postsModerated += 1;
              if (result.errorCount === 0) {
                consecutiveInfraErrors = 0;
              }

              if (result.reasons.length > 0) {
                flaggedPosts += 1;
                report.addFlaggedPost({
                  user: item.user,
                  update: item.update,
                  knownGoodPostCount: item.knownGoodPostCount,
                  priority: result.priority,
                  text: result.text,
                  imageUrls: result.imageUrls,
                  reasons: result.reasons,
                  rawModeration: result.rawModeration,
                  includeFullContent: config.includeFullContent
                });
              }
            } catch (error) {
              const errorMessage = describeError(error);
              if (error instanceof OpenAIRunBudgetExceededError) {
                abortReason = error.message;
              }
              counters.errors += 1;
              await errorLogger.write({
                postId: item.update.id,
                userId: item.user.id,
                stage: "openai_image_post_moderation",
                error: errorMessage
              });
              errorReport.addErroredPost({
                update: item.update,
                user: item.user,
                stage: "openai_image_post_moderation",
                error: errorMessage
              });
              noteErrorEvent({
                type: classifyConsoleError("openai_image_post_moderation", errorMessage),
                stage: "openai_image_post_moderation",
                message: errorMessage,
                postId: item.update.id,
                recoverable: false
              });
              if (error instanceof OpenAIRunBudgetExceededError) {
                throw new ScanAbortError(error.message);
              }
            } finally {
              progress.update({
                scanned: counters.postsScanned - startingPostsScanned,
                moderated: counters.postsModerated - startingPostsModerated,
                skippedTrusted: counters.postsSkippedTrusted - startingPostsSkippedTrusted,
                flaggedPosts,
                errors: counters.errors - startingErrors
              });
            }
          }
        }
      } catch (error) {
        if (error instanceof ScanAbortError) {
          abortReason = error.message;
        } else {
          throw error;
        }
      }

      if (abortReason) break;

      const lastUpdate = updates[updates.length - 1];
      if (!lastUpdate.postTime) {
        throw new Error(`Update ${lastUpdate.id} has no postTime after query required a postTime.`);
      }

      checkpoint = checkpointAfterBatch(checkpoint, lastUpdate.postTime, lastUpdate.id, counters);
      await saveCheckpoint(config.checkpointFile, checkpoint);
      progress.update({
        scanned: counters.postsScanned - startingPostsScanned,
        moderated: counters.postsModerated - startingPostsModerated,
        skippedTrusted: counters.postsSkippedTrusted - startingPostsSkippedTrusted,
        flaggedPosts,
        errors: counters.errors - startingErrors
      }, true);

      if (updates.length < take) break;
    }

    const summary: Summary = {
      postsScanned: counters.postsScanned,
      postsSkippedTrusted: counters.postsSkippedTrusted,
      postsModerated: counters.postsModerated,
      usersFlagged: 0,
      postsFlagged: 0,
      errors: counters.errors
    };
    const finalReport = report.build(config, summary);
    await writeReport(config.outputFile, finalReport);
    const finalErrorReport = errorReport.build();
    await writeErrorReport(config.errorReportFile, finalErrorReport);
    if (abortReason) {
      progress.info(abortReason);
    }
    if (rateLimiter) {
      const stats = rateLimiter.stats();
      progress.info(
        `OpenAI usage this run: ${stats.requestsUsed}/${stats.requestsPerRun} requests, ` +
          `${stats.tokensUsed}/${stats.tokensPerRun} estimated tokens`
      );
    }
    progress.finish({
      scanned: counters.postsScanned - startingPostsScanned,
      moderated: counters.postsModerated - startingPostsModerated,
      skippedTrusted: counters.postsSkippedTrusted - startingPostsSkippedTrusted,
      flaggedPosts: finalReport.summary.postsFlagged,
      errors: counters.errors - startingErrors
    });
    console.error(`Report written: ${config.outputFile}`);
    console.error(`Error review report written: ${config.errorReportFile}`);
    console.error(`Checkpoint written: ${config.checkpointFile}`);
    console.error(`Errors log: ${config.errorLogFile}`);
    if (abortReason) {
      process.exitCode = 2;
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
