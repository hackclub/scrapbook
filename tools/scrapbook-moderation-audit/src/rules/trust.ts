import type { AuditUser, Finding } from "../types.js";
import { extractUrls } from "../utils/urls.js";

export type TrustDecisionInput = {
  user: AuditUser;
  knownGoodPostCount: number;
  trustedGoodPostThreshold: number;
  newAccountYears: number;
  hasImages: boolean;
  text: string;
  localFindings: Finding[];
  suspiciousTextShape: boolean;
};

export function isNewAccount(user: AuditUser, newAccountYears: number, now = new Date()): boolean {
  if (!user.createdAt) return false;
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - newAccountYears);
  return user.createdAt > cutoff;
}

export function isTrustedAuthor(input: Pick<TrustDecisionInput, "knownGoodPostCount" | "trustedGoodPostThreshold">): boolean {
  return input.knownGoodPostCount >= input.trustedGoodPostThreshold;
}

export function shouldCallOpenAI(input: TrustDecisionInput): boolean {
  const hasText = input.text.trim().length > 0;
  const hasExternalLinks = extractUrls(input.text).length > 0;
  const trusted = isTrustedAuthor(input);

  if (!hasText && !input.hasImages) return false;

  if (
    trusted &&
    !input.hasImages &&
    !hasExternalLinks &&
    input.localFindings.length === 0 &&
    !input.suspiciousTextShape
  ) {
    return false;
  }

  return true;
}
