import type { Finding, Severity } from "../types.js";

type PatternGroup = {
  label: string;
  severity: Severity;
  patterns: RegExp[];
};

const AD_PATTERNS: PatternGroup[] = [
  {
    label: "crypto_or_trading_promo",
    severity: "high",
    patterns: [
      /\bcrypto signals?\b/i,
      /\bforex signals?\b/i,
      /\bguaranteed profit\b/i,
      /\binvestment opportunity\b/i,
      /\btelegram channel\b/i,
      /\bjoin my telegram\b/i,
      /\bwhatsapp group\b/i
    ]
  },
  {
    label: "commercial_solicitation",
    severity: "medium",
    patterns: [
      /\bbuy now\b/i,
      /\bpromo code\b/i,
      /\bdiscount code\b/i,
      /\bsponsored\b/i,
      /\baffiliate\b/i,
      /\bdm me to buy\b/i,
      /\border now\b/i
    ]
  },
  {
    label: "restricted_or_unwelcome_product",
    severity: "high",
    patterns: [
      /\bcasino\b/i,
      /\bbetting\b/i,
      /\bgambling\b/i,
      /\bvape\b/i,
      /\bnicotine\b/i,
      /\bweed\b/i,
      /\bthc\b/i,
      /\bcbd\b/i,
      /\bonlyfans\b/i
    ]
  }
];

export function detectAds(text: string): Finding[] {
  return AD_PATTERNS.flatMap((group) => {
    const matched = group.patterns
      .map((pattern) => text.match(pattern)?.[0])
      .filter((value): value is string => Boolean(value));

    if (matched.length === 0) return [];

    return [
      {
        source: "ad_heuristic",
        label: group.label,
        severity: group.severity,
        detail: `Matched phrase: ${[...new Set(matched)].join(", ")}`,
        inputTypes: ["text"]
      }
    ];
  });
}
