import { ProgressLogger } from "./progress.js";

export type ConsoleErrorType =
  | "openai_rate_limit"
  | "openai_server"
  | "openai_auth"
  | "openai_image"
  | "database"
  | "configuration"
  | "unknown";

export type ConsoleErrorEvent = {
  type: ConsoleErrorType;
  stage: string;
  message: string;
  postId?: string;
  recoverable?: boolean;
};

export function classifyConsoleError(stage: string, message: string): ConsoleErrorType {
  if (/openai_image|image/i.test(stage) || /image_url|image|unsupported media|could not download/i.test(message)) {
    return "openai_image";
  }

  if (/401|403|api key|auth|unauthorized|permission/i.test(message)) {
    return "openai_auth";
  }

  if (/429|rate limit|too many requests/i.test(message)) {
    return "openai_rate_limit";
  }

  if (/\b5\d\d\b|server error|bad gateway|service unavailable|gateway timeout/i.test(message)) {
    return "openai_server";
  }

  if (/prisma|postgres|database|connection|timeout|p20\d\d/i.test(message)) {
    return "database";
  }

  if (/OPENAI_API_KEY|PG_DATABASE_URL|AUDIT_DATABASE_URL|required/i.test(message)) {
    return "configuration";
  }

  return "unknown";
}

export function shouldAbortOnErrorType(type: ConsoleErrorType): boolean {
  return (
    type === "openai_rate_limit" ||
    type === "openai_auth" ||
    type === "openai_server" ||
    type === "database" ||
    type === "configuration"
  );
}

export class ErrorConsoleReporter {
  private readonly counts = new Map<ConsoleErrorType, number>();

  constructor(private readonly progress: ProgressLogger) {}

  record(event: ConsoleErrorEvent): void {
    const count = (this.counts.get(event.type) ?? 0) + 1;
    this.counts.set(event.type, count);

    if (count !== 1 && count % 10 !== 0) return;

    const post = event.postId ? ` post=${event.postId}` : "";
    const sample = event.message.length > 180 ? `${event.message.slice(0, 180)}...` : event.message;
    this.progress.info(
      `[${event.type}] ${count} error${count === 1 ? "" : "s"} so far at ${event.stage}.${post} ${this.guidance(event.type, event.recoverable)} Sample: ${sample}`
    );
  }

  private guidance(type: ConsoleErrorType, recoverable?: boolean): string {
    if (type === "openai_rate_limit") {
      return "Consider stopping and resuming with --concurrency 1 or a larger MODERATION_SLEEP_MS.";
    }
    if (type === "openai_auth") {
      return "Stop the run and check OPENAI_API_KEY or project permissions.";
    }
    if (type === "database") {
      return "Stop if this repeats; check the production DB URL/connectivity.";
    }
    if (type === "openai_server") {
      return "Usually transient; stop and resume later if it keeps growing.";
    }
    if (type === "openai_image") {
      return recoverable
        ? "Recovered with text-only retry; review image URL accessibility later."
        : "Check image URL accessibility/size if this repeats.";
    }
    if (type === "configuration") {
      return "Stop the run and fix environment/configuration.";
    }
    return "Inspect moderation-error-report.json if this repeats.";
  }
}
