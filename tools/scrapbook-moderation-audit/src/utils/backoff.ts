import { sleep } from "./sleep.js";

function statusFromError(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    return Number.isFinite(status) ? status : undefined;
  }
  return undefined;
}

export function isRetryableError(error: unknown): boolean {
  const status = statusFromError(error);
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export function looksImageSpecificError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /image|image_url|unsupported media|invalid.*url|could not download/i.test(message);
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw error;
      }

      const delayMs = Math.min(30_000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 500);
      await sleep(delayMs);
    }
  }
}
