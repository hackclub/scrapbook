import { sleep } from "./sleep.js";

export type OpenAIRateLimitConfig = {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestsPerRun: number;
  tokensPerRun: number;
};

export type OpenAIRateLimitStats = {
  requestsUsed: number;
  tokensUsed: number;
  requestsPerRun: number;
  tokensPerRun: number;
};

export type TokenEstimateInput = {
  text: string;
  imageCount: number;
};

export class OpenAIRunBudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIRunBudgetExceededError";
  }
}

export function estimateModerationTokens(input: TokenEstimateInput): number {
  const textTokens = Math.ceil(input.text.length / 4);
  const imageTokens = input.imageCount * 300;
  return Math.max(1, textTokens + imageTokens);
}

export class OpenAIRateLimiter {
  private minuteWindowStartedAt = Date.now();
  private minuteRequests = 0;
  private minuteTokens = 0;
  private runRequests = 0;
  private runTokens = 0;
  private queue = Promise.resolve();

  constructor(private readonly config: OpenAIRateLimitConfig) {}

  async reserve(estimatedTokens: number): Promise<void> {
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;
    try {
      await this.reserveLocked(estimatedTokens);
    } finally {
      release();
    }
  }

  stats(): OpenAIRateLimitStats {
    return {
      requestsUsed: this.runRequests,
      tokensUsed: this.runTokens,
      requestsPerRun: this.config.requestsPerRun,
      tokensPerRun: this.config.tokensPerRun
    };
  }

  private async reserveLocked(estimatedTokens: number): Promise<void> {
    if (this.runRequests + 1 > this.config.requestsPerRun) {
      throw new OpenAIRunBudgetExceededError(
        `OpenAI request budget reached for this run: ${this.runRequests}/${this.config.requestsPerRun}`
      );
    }

    if (this.runTokens + estimatedTokens > this.config.tokensPerRun) {
      throw new OpenAIRunBudgetExceededError(
        `OpenAI token budget reached for this run: ${this.runTokens}/${this.config.tokensPerRun}`
      );
    }

    while (true) {
      this.resetMinuteWindowIfNeeded();

      const requestFits = this.minuteRequests + 1 <= this.config.requestsPerMinute;
      const tokensFit = this.minuteTokens + estimatedTokens <= this.config.tokensPerMinute;
      if (requestFits && tokensFit) break;

      const waitMs = Math.max(250, 60_000 - (Date.now() - this.minuteWindowStartedAt));
      await sleep(waitMs);
    }

    this.minuteRequests += 1;
    this.minuteTokens += estimatedTokens;
    this.runRequests += 1;
    this.runTokens += estimatedTokens;
  }

  private resetMinuteWindowIfNeeded(): void {
    if (Date.now() - this.minuteWindowStartedAt < 60_000) return;
    this.minuteWindowStartedAt = Date.now();
    this.minuteRequests = 0;
    this.minuteTokens = 0;
  }
}
