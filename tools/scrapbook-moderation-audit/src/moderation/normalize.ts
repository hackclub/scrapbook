import type { Finding, InputType } from "../types.js";
import { CATEGORY_THRESHOLDS, severityForCategory } from "./thresholds.js";

type ModerationResult = {
  categories?: Record<string, boolean>;
  category_scores?: Record<string, number>;
  category_applied_input_types?: Record<string, string[]>;
};

function normalizeInputTypes(value: string[] | undefined): InputType[] | undefined {
  if (!value) return undefined;
  const inputTypes = value
    .map((item) => (item === "image_url" ? "image" : item))
    .filter((item): item is InputType => item === "text" || item === "image");
  return inputTypes.length > 0 ? [...new Set(inputTypes)] : undefined;
}

export function normalizeModerationFindings(response: unknown, resultIndex = 0): Finding[] {
  const result = (response as { results?: ModerationResult[] })?.results?.[resultIndex];
  if (!result) return [];

  const categories = result.categories ?? {};
  const scores = result.category_scores ?? {};
  const appliedInputTypes = result.category_applied_input_types ?? {};
  const categoryNames = new Set([...Object.keys(categories), ...Object.keys(scores)]);

  return [...categoryNames].flatMap((category) => {
    const score = scores[category] ?? 0;
    const threshold = CATEGORY_THRESHOLDS[category];
    const flagged = Boolean(categories[category]);
    const overThreshold = threshold !== undefined && score >= threshold;

    if (!flagged && !overThreshold) return [];

    return [
      {
        source: "openai_moderation",
        label: category,
        severity: severityForCategory(category),
        score,
        detail: flagged ? "Category flagged by OpenAI moderation" : `Score exceeded threshold ${threshold}`,
        inputTypes: normalizeInputTypes(appliedInputTypes[category])
      } satisfies Finding
    ];
  });
}
