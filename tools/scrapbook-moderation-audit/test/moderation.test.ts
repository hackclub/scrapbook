import assert from "node:assert/strict";
import test from "node:test";
import { normalizeModerationFindings } from "../src/moderation/normalize.js";

test("normalizeModerationFindings includes flagged categories and applied input types", () => {
  const findings = normalizeModerationFindings({
    results: [
      {
        categories: {
          harassment: true,
          violence: false
        },
        category_scores: {
          harassment: 0.82,
          violence: 0.2
        },
        category_applied_input_types: {
          harassment: ["text"],
          violence: ["text", "image"]
        }
      }
    ]
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].label, "harassment");
  assert.equal(findings[0].source, "openai_moderation");
  assert.deepEqual(findings[0].inputTypes, ["text"]);
});

test("normalizeModerationFindings includes scores above custom thresholds", () => {
  const findings = normalizeModerationFindings({
    results: [
      {
        categories: {
          "sexual/minors": false
        },
        category_scores: {
          "sexual/minors": 0.02
        },
        category_applied_input_types: {
          "sexual/minors": ["text"]
        }
      }
    ]
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].label, "sexual/minors");
  assert.equal(findings[0].severity, "high");
});
