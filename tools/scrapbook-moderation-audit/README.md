# Scrapbook Moderation Audit

Read-only TypeScript CLI for auditing Scrapbook posts with local spam/safety rules and optional OpenAI moderation.

This tool does not hide, delete, update, ban, or write to the Scrapbook database. It only reads `Updates` and `Accounts` through Prisma and writes local report files for human review.

## Setup

```bash
cd tools/scrapbook-moderation-audit
npm install
npm run prisma:generate
cp .env.example .env
```

Set either `AUDIT_DATABASE_URL` or `PG_DATABASE_URL`. A read-only Postgres user is strongly recommended.

For real OpenAI moderation, set `OPENAI_API_KEY` and pass `--no-dry-run`. Dry-run mode is the default and never calls OpenAI.

## Commands

```bash
npm run audit:dry
npm run audit -- --dry-run --limit 100
npm run audit -- --no-dry-run --limit 10 --concurrency 1
npm run audit -- --resume
npm run audit -- --user some-user-id
npm run audit -- --created-after 2024-01-01
```

From the repository root:

```bash
npm run moderation:audit -- --dry-run --limit 100
```

## Behavior

- Scans `Updates` ordered by `postTime ASC, id ASC`.
- Scans posts from the last two years by default. Pass `--created-after` to choose a different start date.
- Resolves authors through both `Accounts` and `SlackAccounts`.
- Reads `Updates.text`, `Updates.attachments`, `Updates.muxPlaybackIDs`, and the minimum author profile fields.
- Treats `attachments` with image extensions as image URLs.
- Skips Mux videos and non-image attachments for image moderation.
- In real runs, fetches each image URL, validates it as `image/jpeg`, `image/png`, `image/gif`, or `image/webp`, enforces the 20 MB default limit, converts it to a base64 `data:image/...` URL, and sends that data URL to OpenAI as an `image_url` input.
- Uses stable checkpoint pagination; no `skip` pagination.
- Writes checkpoint state after every batch.
- Prints a compact progress bar with scanned posts, OpenAI calls, trusted skips, flagged posts, and errors.
- Keeps logs intentionally sparse: startup scope, resume cursor, progress, grouped error-type warnings, and final output paths.
- Prints error-type warnings on the first occurrence and every 10th repeat, with guidance for rate limits, auth/config problems, database errors, image URL failures, and unknown failures.
- Aborts automatically after `MAX_CONSECUTIVE_INFRA_ERRORS` consecutive OpenAI/DB/config errors. This prevents a full scan from turning into thousands of unusable per-post errors when the API is rate-limiting or misconfigured.
- Paces OpenAI moderation calls with conservative defaults under the published `omni-moderation-latest` limits: `OPENAI_MODERATION_RPM=200`, `OPENAI_MODERATION_TPM=4500`, `OPENAI_MODERATION_RPD=9000`, and `OPENAI_MODERATION_TPD=900000`.
- Stops when the per-run OpenAI budget is reached. With a 10,000 RPD account limit, a large historical scan may need multiple `--resume` runs across multiple days.
- Batches text-only posts before calling OpenAI. Defaults are `OPENAI_TEXT_BATCH_SIZE=40` and `OPENAI_TEXT_BATCH_TOKEN_LIMIT=4000`, so a batch stays under the 5,000 TPM limit with some headroom.
- Moderates posts with images one-by-one because each multimodal moderation input combines text and images for a single post; text-only posts are the safe batching path.

## Outputs

Defaults:

```txt
moderation-report.json
moderation-error-report.json
moderation-checkpoint.json
moderation-errors.jsonl
```

The report is grouped by user/profile and includes post previews, image URLs, and structured reasons. Raw OpenAI responses are included only with `--include-raw-openai`.

`moderation-error-report.json` is for manual review of posts that hit errors. It includes full post text, author context, attachments, Mux playback IDs, the error stage, the error message, and any metadata needed to understand what failed. `moderation-errors.jsonl` remains the append-friendly operational log.

Image preparation failures use the `image_preparation` stage and include the original image URL. OpenAI image-input failures use `openai_image_moderation` and include metadata about the converted images that were attempted.

## Safety Notes

Findings are a triage queue, not final judgment. Hack Club posts can contain jokes, cybersecurity language, project demos, and teen slang that need human review.

Do not add database mutations to this tool. Keep it physically read-only: `findMany`, `findFirst`, and `count` only.

## Recommended Rollout

1. `npm run audit -- --dry-run --limit 100`
2. Inspect `moderation-report.json`
3. `npm run audit -- --no-dry-run --limit 10 --concurrency 1`
4. Try `--created-after` for recent accounts/posts
5. Run a resumable historical scan only after sample results look sane

If you hit OpenAI rate limits, stop and resume more slowly:

```bash
MODERATION_CONCURRENCY=1 MODERATION_SLEEP_MS=5000 npm run audit -- --no-dry-run --resume
```

You can also make the abort threshold stricter:

```bash
MAX_CONSECUTIVE_INFRA_ERRORS=3 npm run audit -- --no-dry-run --resume
```

To use the exact published moderation limits instead of the conservative defaults:

```bash
OPENAI_MODERATION_RPM=250 OPENAI_MODERATION_TPM=5000 OPENAI_MODERATION_RPD=10000 OPENAI_MODERATION_TPD=1000000 npm run audit -- --no-dry-run --resume
```
