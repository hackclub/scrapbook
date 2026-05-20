import type { Severity } from "../types.js";

export const CATEGORY_THRESHOLDS: Record<string, number> = {
  "sexual/minors": 0.01,
  "self-harm/instructions": 0.2,
  "self-harm/intent": 0.2,
  "violence/graphic": 0.35,
  "hate/threatening": 0.3,
  "illicit/violent": 0.3,
  sexual: 0.5,
  "self-harm": 0.5,
  violence: 0.65,
  harassment: 0.7,
  "harassment/threatening": 0.7,
  hate: 0.6,
  illicit: 0.6
};

const HIGH_SEVERITY_CATEGORIES = new Set([
  "sexual/minors",
  "self-harm/instructions",
  "self-harm/intent",
  "hate/threatening",
  "illicit/violent",
  "violence/graphic"
]);

const MEDIUM_SEVERITY_CATEGORIES = new Set([
  "sexual",
  "self-harm",
  "violence",
  "harassment",
  "harassment/threatening",
  "hate",
  "illicit"
]);

export function severityForCategory(category: string): Severity {
  if (HIGH_SEVERITY_CATEGORIES.has(category)) return "high";
  if (MEDIUM_SEVERITY_CATEGORIES.has(category)) return "medium";
  return "low";
}
