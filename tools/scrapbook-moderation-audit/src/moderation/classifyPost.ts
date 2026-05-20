import type { AuditConfig } from "../config.js";
import type { AuditUpdate, AuditUser, Finding, InputType, ReportPriority } from "../types.js";
import type { JsonlErrorLogger } from "../output/jsonl.js";
import type { ErrorReportBuilder } from "../output/errorReport.js";
import type { OpenAIModerationClient } from "./openai.js";
import type { OpenAIRateLimiter } from "../utils/openaiRateLimiter.js";
import { detectAds } from "../rules/ads.js";
import { detectTeenSafetyTerms } from "../rules/teenSafety.js";
import { detectSuspiciousLinks } from "../rules/links.js";
import { isNewAccount, isTrustedAuthor, shouldCallOpenAI } from "../rules/trust.js";
import { extractUrls, extractImageUrlsFromAttachments } from "../utils/urls.js";
import { describeError, hasSuspiciousTextShape, normalizeText } from "../utils/text.js";
import { looksImageSpecificError } from "../utils/backoff.js";
import { classifyConsoleError, type ConsoleErrorEvent } from "../utils/errorConsole.js";
import { moderatePostWithOpenAI } from "./openai.js";
import { normalizeModerationFindings } from "./normalize.js";
import { prepareImageForModeration, type PreparedImageInput } from "./images.js";

export type ClassificationResult = {
  text: string;
  imageUrls: string[];
  reasons: Finding[];
  rawModeration?: unknown;
  shouldModerate: boolean;
  skippedTrusted: boolean;
  priority: ReportPriority;
  errorCount: number;
  errorEvents: ConsoleErrorEvent[];
};

function priorityForPost(input: {
  user: AuditUser;
  knownGoodPostCount: number;
  config: AuditConfig;
  hasImages: boolean;
  hasLinks: boolean;
  localFindings: Finding[];
}): ReportPriority {
  const trusted = isTrustedAuthor({
    knownGoodPostCount: input.knownGoodPostCount,
    trustedGoodPostThreshold: input.config.trustedGoodPostThreshold
  });

  if (trusted && (input.hasImages || input.hasLinks || input.localFindings.length > 0)) {
    return "trusted_skip_overridden";
  }

  if (isNewAccount(input.user, input.config.newAccountYears)) {
    return "new_account";
  }

  return "regular";
}

async function prepareImages(input: {
  imageUrls: string[];
  update: AuditUpdate;
  user: AuditUser;
  text: string;
  maxImageBytes: number;
  errorLogger: JsonlErrorLogger;
  errorReport: ErrorReportBuilder;
}): Promise<{ preparedImages: PreparedImageInput[]; errorEvents: ConsoleErrorEvent[] }> {
  const preparedImages: PreparedImageInput[] = [];
  const errorEvents: ConsoleErrorEvent[] = [];

  for (const imageUrl of input.imageUrls) {
    try {
      preparedImages.push(await prepareImageForModeration(imageUrl, input.maxImageBytes));
    } catch (error) {
      const errorMessage = describeError(error);
      const stage = "image_preparation";
      await input.errorLogger.write({
        postId: input.update.id,
        userId: input.user.id,
        stage,
        error: errorMessage,
        metadata: { imageUrl }
      });
      input.errorReport.addErroredPost({
        update: input.update,
        user: input.user,
        text: input.text,
        stage,
        error: errorMessage,
        metadata: { imageUrl }
      });
      errorEvents.push({
        type: classifyConsoleError(stage, errorMessage),
        stage,
        message: errorMessage,
        postId: input.update.id,
        recoverable: true
      });
    }
  }

  return { preparedImages, errorEvents };
}

export async function classifyPost(input: {
  update: AuditUpdate;
  user: AuditUser;
  knownGoodPostCount: number;
  config: AuditConfig;
  openai?: OpenAIModerationClient;
  rateLimiter?: OpenAIRateLimiter;
  errorLogger: JsonlErrorLogger;
  errorReport: ErrorReportBuilder;
  skipOpenAI?: boolean;
}): Promise<ClassificationResult> {
  const text = normalizeText(input.update.text);
  const imageUrls = extractImageUrlsFromAttachments(input.update.attachments ?? [], input.config.maxImagesPerPost);
  const localFindings = [
    ...detectAds(text),
    ...detectTeenSafetyTerms(text),
    ...detectSuspiciousLinks(text)
  ];
  const suspiciousTextShape = hasSuspiciousTextShape(text);
  const hasLinks = extractUrls(text).length > 0;
  const shouldModerate = shouldCallOpenAI({
    user: input.user,
    knownGoodPostCount: input.knownGoodPostCount,
    trustedGoodPostThreshold: input.config.trustedGoodPostThreshold,
    newAccountYears: input.config.newAccountYears,
    hasImages: imageUrls.length > 0,
    text,
    localFindings,
    suspiciousTextShape
  });
  const priority = priorityForPost({
    user: input.user,
    knownGoodPostCount: input.knownGoodPostCount,
    config: input.config,
    hasImages: imageUrls.length > 0,
    hasLinks,
    localFindings
  });

  if (!shouldModerate) {
    return {
      text,
      imageUrls,
      reasons: localFindings,
      shouldModerate,
      skippedTrusted: true,
      priority,
      errorCount: 0,
      errorEvents: []
    };
  }

  if (input.skipOpenAI) {
    return {
      text,
      imageUrls,
      shouldModerate,
      skippedTrusted: false,
      priority,
      errorCount: 0,
      errorEvents: [],
      reasons: localFindings
    };
  }

  if (input.config.dryRun) {
    const wouldSendInputTypes = [
      text.trim() ? "text" : null,
      imageUrls.length > 0 ? "image" : null
    ].filter((value): value is InputType => Boolean(value));

    return {
      text,
      imageUrls,
      shouldModerate,
      skippedTrusted: false,
      priority,
      errorCount: 0,
      errorEvents: [],
      reasons: [
        ...localFindings,
        {
          source: "dry_run",
          label: "openai_moderation_skipped",
          severity: "low",
          detail: "Would have sent this post to OpenAI moderation",
          inputTypes: wouldSendInputTypes
        }
      ]
    };
  }

  if (!input.openai) {
    throw new Error("OpenAI client is required outside dry-run mode.");
  }

  const { preparedImages, errorEvents: imagePreparationEvents } = await prepareImages({
    imageUrls,
    update: input.update,
    user: input.user,
    text,
    maxImageBytes: input.config.maxImageBytes,
    errorLogger: input.errorLogger,
    errorReport: input.errorReport
  });
  const moderationImageUrls = preparedImages.map((image) => image.moderationUrl);

  try {
    const rawModeration = await moderatePostWithOpenAI({
      client: input.openai,
      model: input.config.moderationModel,
      text,
      imageUrls: moderationImageUrls,
      sleepMs: input.config.sleepMs,
      rateLimiter: input.rateLimiter
    });
    const openAIFindings = normalizeModerationFindings(rawModeration);
    return {
      text,
      imageUrls,
      shouldModerate,
      skippedTrusted: false,
      priority,
      reasons: [...localFindings, ...openAIFindings],
      rawModeration: input.config.includeRawOpenAI ? rawModeration : undefined,
      errorCount: imagePreparationEvents.length,
      errorEvents: imagePreparationEvents
    };
  } catch (error) {
    if (moderationImageUrls.length > 0 && looksImageSpecificError(error)) {
      const errorMessage = describeError(error);
      await input.errorLogger.write({
        postId: input.update.id,
        userId: input.user.id,
        stage: "openai_image_moderation",
        error: errorMessage,
        metadata: {
          imageUrls,
          preparedImages: preparedImages.map((image) => ({
            originalUrl: image.originalUrl,
            mediaType: image.mediaType,
            bytes: image.bytes
          }))
        }
      });
      input.errorReport.addErroredPost({
        update: input.update,
        user: input.user,
        text,
        stage: "openai_image_moderation",
        error: errorMessage,
        metadata: {
          imageUrls,
          preparedImages: preparedImages.map((image) => ({
            originalUrl: image.originalUrl,
            mediaType: image.mediaType,
            bytes: image.bytes
          })),
          recoveredWithTextOnlyRetry: true
        }
      });

      const rawModeration = await moderatePostWithOpenAI({
        client: input.openai,
        model: input.config.moderationModel,
        text,
        imageUrls: [],
        sleepMs: input.config.sleepMs,
        rateLimiter: input.rateLimiter
      });
      const openAIFindings = normalizeModerationFindings(rawModeration);

      return {
        text,
        imageUrls,
        shouldModerate,
        skippedTrusted: false,
        priority,
        reasons: [...localFindings, ...openAIFindings],
        rawModeration: input.config.includeRawOpenAI ? rawModeration : undefined,
        errorCount: imagePreparationEvents.length + 1,
        errorEvents: [
          ...imagePreparationEvents,
          {
            type: classifyConsoleError("openai_image_moderation", errorMessage),
            stage: "openai_image_moderation",
            message: errorMessage,
            postId: input.update.id,
            recoverable: true
          }
        ]
      };
    }

    throw error;
  }
}
