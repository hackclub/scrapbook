import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import dotenv from "dotenv";
import { z } from "zod";

const toolRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)), "..");

dotenv.config({ path: path.resolve(toolRoot, ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: false });

const booleanFromEnv = z
  .union([z.boolean(), z.string(), z.undefined()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return undefined;
    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  });

const optionalDate = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid date: ${value}` });
      return z.NEVER;
    }
    return date;
  });

function defaultCreatedAfter(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 2);
  return date;
}

const rawConfigSchema = z.object({
  auditDatabaseUrl: z.string().optional(),
  pgDatabaseUrl: z.string().optional(),
  openaiApiKey: z.string().optional(),
  moderationModel: z.string().default("omni-moderation-latest"),
  batchSize: z.coerce.number().int().positive().default(100),
  concurrency: z.coerce.number().int().positive().default(2),
  sleepMs: z.coerce.number().int().min(0).default(250),
  maxImagesPerPost: z.coerce.number().int().min(0).default(4),
  maxImageBytes: z.coerce.number().int().positive().default(20 * 1024 * 1024),
  maxConsecutiveInfraErrors: z.coerce.number().int().positive().default(10),
  openaiRequestsPerMinute: z.coerce.number().int().positive().default(200),
  openaiTokensPerMinute: z.coerce.number().int().positive().default(4500),
  openaiRequestsPerRun: z.coerce.number().int().positive().default(9000),
  openaiTokensPerRun: z.coerce.number().int().positive().default(900_000),
  openaiTextBatchSize: z.coerce.number().int().positive().default(40),
  openaiTextBatchTokenLimit: z.coerce.number().int().positive().default(4000),
  trustedGoodPostThreshold: z.coerce.number().int().positive().default(15),
  newAccountYears: z.coerce.number().int().positive().default(2),
  outputFile: z.string().default("./moderation-report.json"),
  checkpointFile: z.string().default("./moderation-checkpoint.json"),
  errorLogFile: z.string().default("./moderation-errors.jsonl"),
  errorReportFile: z.string().default("./moderation-error-report.json"),
  dryRun: z.boolean().default(true),
  resume: z.boolean().default(false),
  limit: z.coerce.number().int().positive().optional(),
  createdAfter: optionalDate,
  createdBefore: optionalDate,
  user: z.string().optional(),
  includeRawOpenAI: z.boolean().default(false),
  includeFullContent: z.boolean().default(false)
});

export type AuditConfig = z.infer<typeof rawConfigSchema> & {
  databaseUrl: string | undefined;
};

export function loadConfig(argv = process.argv): AuditConfig {
  const program = new Command();

  program
    .name("scrapbook-moderation-audit")
    .description("Read-only Scrapbook moderation audit worker")
    .option("--dry-run", "run local checks without calling OpenAI")
    .option("--no-dry-run", "call OpenAI moderation when a post should be moderated")
    .option("--resume", "resume from the checkpoint file")
    .option("--limit <number>", "maximum posts to scan")
    .option("--created-after <date>", "scan posts created on or after this date")
    .option("--created-before <date>", "scan posts created before this date")
    .option("--user <id-or-username>", "scan a single user by id, username, or Slack ID")
    .option("--concurrency <number>", "OpenAI moderation concurrency")
    .option("--batch-size <number>", "database batch size")
    .option("--output <path>", "report output path")
    .option("--checkpoint <path>", "checkpoint file path")
    .option("--error-log <path>", "JSONL error log path")
    .option("--error-report <path>", "JSON error review report path")
    .option("--max-consecutive-infra-errors <number>", "abort after this many consecutive OpenAI/DB/config errors")
    .option("--openai-requests-per-minute <number>", "OpenAI moderation request pacing limit")
    .option("--openai-tokens-per-minute <number>", "OpenAI moderation token pacing limit")
    .option("--openai-requests-per-run <number>", "OpenAI moderation request budget for this run")
    .option("--openai-tokens-per-run <number>", "OpenAI moderation token budget for this run")
    .option("--openai-text-batch-size <number>", "maximum text-only posts per moderation request")
    .option("--openai-text-batch-token-limit <number>", "estimated token cap per text-only moderation batch")
    .option("--include-raw-openai", "include raw moderation response in report")
    .option("--include-full-content", "include full post content instead of a preview");

  program.parse(argv);
  const options = program.opts();

  const dryRunFromEnv = booleanFromEnv.parse(process.env.DRY_RUN);
  const includeRawFromEnv = booleanFromEnv.parse(process.env.INCLUDE_RAW_OPENAI);

  const parsed = rawConfigSchema.parse({
    auditDatabaseUrl: process.env.AUDIT_DATABASE_URL || undefined,
    pgDatabaseUrl: process.env.PG_DATABASE_URL || undefined,
    openaiApiKey: process.env.OPENAI_API_KEY || undefined,
    moderationModel: process.env.MODERATION_MODEL,
    batchSize: options.batchSize ?? process.env.MODERATION_BATCH_SIZE,
    concurrency: options.concurrency ?? process.env.MODERATION_CONCURRENCY,
    sleepMs: process.env.MODERATION_SLEEP_MS,
    maxImagesPerPost: process.env.MAX_IMAGES_PER_POST,
    maxImageBytes: process.env.MAX_IMAGE_BYTES,
    maxConsecutiveInfraErrors: options.maxConsecutiveInfraErrors ?? process.env.MAX_CONSECUTIVE_INFRA_ERRORS,
    openaiRequestsPerMinute: options.openaiRequestsPerMinute ?? process.env.OPENAI_MODERATION_RPM,
    openaiTokensPerMinute: options.openaiTokensPerMinute ?? process.env.OPENAI_MODERATION_TPM,
    openaiRequestsPerRun: options.openaiRequestsPerRun ?? process.env.OPENAI_MODERATION_RPD,
    openaiTokensPerRun: options.openaiTokensPerRun ?? process.env.OPENAI_MODERATION_TPD,
    openaiTextBatchSize: options.openaiTextBatchSize ?? process.env.OPENAI_TEXT_BATCH_SIZE,
    openaiTextBatchTokenLimit: options.openaiTextBatchTokenLimit ?? process.env.OPENAI_TEXT_BATCH_TOKEN_LIMIT,
    trustedGoodPostThreshold: process.env.TRUSTED_GOOD_POST_THRESHOLD,
    newAccountYears: process.env.NEW_ACCOUNT_YEARS,
    outputFile: options.output ?? process.env.OUTPUT_FILE,
    checkpointFile: options.checkpoint ?? process.env.CHECKPOINT_FILE,
    errorLogFile: options.errorLog ?? process.env.ERROR_LOG_FILE,
    errorReportFile: options.errorReport ?? process.env.ERROR_REPORT_FILE,
    dryRun: options.dryRun ?? dryRunFromEnv ?? true,
    resume: Boolean(options.resume),
    limit: options.limit,
    createdAfter: options.createdAfter ?? process.env.SCAN_CREATED_AFTER ?? defaultCreatedAfter().toISOString(),
    createdBefore: options.createdBefore ?? process.env.SCAN_CREATED_BEFORE,
    user: options.user ?? process.env.SCAN_USER_ID,
    includeRawOpenAI: Boolean(options.includeRawOpenAI ?? includeRawFromEnv ?? false),
    includeFullContent: Boolean(options.includeFullContent)
  });

  const databaseUrl = parsed.auditDatabaseUrl || parsed.pgDatabaseUrl;
  if (parsed.auditDatabaseUrl) {
    process.env.PG_DATABASE_URL = parsed.auditDatabaseUrl;
  }

  if (!databaseUrl) {
    throw new Error("PG_DATABASE_URL or AUDIT_DATABASE_URL is required.");
  }

  if (!parsed.dryRun && !parsed.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is required when --no-dry-run is used.");
  }

  return { ...parsed, databaseUrl };
}
