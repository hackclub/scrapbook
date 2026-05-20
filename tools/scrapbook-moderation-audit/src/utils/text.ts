export const MAX_TEXT_CHARS = 12_000;

export function normalizeText(text: string | null | undefined): string {
  return (text ?? "")
    .replace(/&amp;/g, "&")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function truncateForModeration(text: string): string {
  return text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;
}

export function contentPreview(text: string, includeFullContent: boolean, maxLength = 500): string {
  if (includeFullContent || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function hasSuspiciousTextShape(text: string): boolean {
  if (text.length > 8_000) return true;

  const words = text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
  if (words.length < 40) return false;

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const mostCommon = Math.max(...counts.values());
  return mostCommon / words.length > 0.22;
}

export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
