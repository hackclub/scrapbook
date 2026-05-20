import type { Finding, Severity } from "../types.js";

type PatternGroup = {
  label: string;
  severity: Severity;
  patterns: RegExp[];
};

const TEEN_SAFETY_PATTERNS: PatternGroup[] = [
  {
    label: "possible_self_harm_reference",
    severity: "medium",
    patterns: [/\bsuicide\b/i, /\bkill myself\b/i, /\bself[- ]harm\b/i, /\bcutting\b/i]
  },
  {
    label: "possible_sexual_content",
    severity: "medium",
    patterns: [/\bnsfw\b/i, /\bporn\b/i, /\bnude\b/i, /\bexplicit\b/i]
  },
  {
    label: "possible_graphic_violence",
    severity: "medium",
    patterns: [/\bgore\b/i, /\bgraphic violence\b/i, /\bdead body\b/i]
  },
  {
    label: "possible_hate_or_harassment",
    severity: "medium",
    patterns: [/\bkill (all )?them\b/i, /\bdeath threat\b/i, /\bhate speech\b/i, /\bslur\b/i]
  },
  {
    label: "possible_illicit_instruction",
    severity: "medium",
    patterns: [/\bhow to steal\b/i, /\bshoplift\b/i, /\bmake a weapon\b/i, /\bhack into\b/i]
  }
];

export function detectTeenSafetyTerms(text: string): Finding[] {
  return TEEN_SAFETY_PATTERNS.flatMap((group) => {
    const matched = group.patterns
      .map((pattern) => text.match(pattern)?.[0])
      .filter((value): value is string => Boolean(value));

    if (matched.length === 0) return [];

    return [
      {
        source: "teen_safety_rule",
        label: group.label,
        severity: group.severity,
        detail: `Matched phrase: ${[...new Set(matched)].join(", ")}`,
        inputTypes: ["text"]
      }
    ];
  });
}
