import { config } from "dotenv";
import { Worker } from "node:worker_threads";

config({ quiet: true });

const VALID_MATCH_MODES = new Set(["word", "substring", "regex"]);
const REGEX_WORKERS = 2;
const REGEX_TIMEOUT_MS = 50;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

class RegexMatcherPool {
  constructor(size) {
    this.queue = [];
    this.nextId = 0;
    this.slots = Array.from({ length: size }, () => ({
      worker: null,
      job: null,
    }));
    this.slots.forEach((slot) => this.startWorker(slot));
  }

  startWorker(slot) {
    const worker = new Worker(
      new URL("./automod-regex-worker.js", import.meta.url),
    );
    worker.unref();
    slot.worker = worker;

    worker.on("message", ({ id, matched }) => {
      if (!slot.job || slot.job.id !== id) return;
      clearTimeout(slot.job.timer);
      slot.job.resolve(Boolean(matched));
      slot.job = null;
      this.dispatch();
    });

    worker.on("error", () => this.restartWorker(slot, worker));
    worker.on("exit", () => this.restartWorker(slot, worker));
  }

  restartWorker(slot, worker) {
    if (slot.worker !== worker) return;

    if (slot.job) {
      clearTimeout(slot.job.timer);
      slot.job.resolve(false);
      slot.job = null;
    }

    slot.worker = null;
    this.startWorker(slot);
    this.dispatch();
  }

  dispatch() {
    for (const slot of this.slots) {
      if (!slot.worker || slot.job || this.queue.length === 0) continue;

      const job = this.queue.shift();
      job.id = this.nextId++;
      slot.job = job;
      job.timer = setTimeout(() => {
        if (slot.job !== job) return;

        const timedOutWorker = slot.worker;
        slot.worker = null;
        slot.job = null;
        job.resolve(false);
        timedOutWorker.terminate().catch(() => {});
        this.startWorker(slot);
        this.dispatch();
      }, REGEX_TIMEOUT_MS);

      try {
        slot.worker.postMessage({
          id: job.id,
          pattern: job.pattern,
          text: job.text,
        });
      } catch {
        clearTimeout(job.timer);
        slot.job = null;
        job.resolve(false);
        this.restartWorker(slot, slot.worker);
      }
    }
  }

  test(pattern, text) {
    return new Promise((resolve) => {
      this.queue.push({ pattern, text, resolve });
      this.dispatch();
    });
  }
}

let regexMatcherPool;
const testRegex = (pattern, text) => {
  regexMatcherPool ??= new RegexMatcherPool(REGEX_WORKERS);
  return regexMatcherPool.test(pattern, text);
};

const buildWordRule = (word, categoryKey = null) => {
  const normalized = word.trim();
  if (!normalized) return null;

  const pattern = new RegExp(
    `(^|[^A-Za-z0-9])${escapeRegExp(normalized)}(?=$|[^A-Za-z0-9])`,
    "i",
  );

  return {
    word: normalized,
    matchMode: "word",
    categoryKey,
    matches: (text) => pattern.test(text),
  };
};

const buildRule = (entry) => {
  if (!entry || typeof entry !== "object" || typeof entry.word !== "string") {
    return null;
  }

  const word = entry.word.trim();
  const configuredMode = entry.match_mode || "word";
  const matchMode = VALID_MATCH_MODES.has(configuredMode)
    ? configuredMode
    : "word";
  const categoryKey =
    typeof entry.category_key === "string" ? entry.category_key : null;
  if (!word) return null;

  if (entry.effect !== "flag") return null;
  if (matchMode === "word") return buildWordRule(word, categoryKey);
  if (matchMode === "regex") {
    try {
      new RegExp(word, "iu");
    } catch {
      return null;
    }

    return {
      word,
      matchMode,
      categoryKey,
      matches: (text) => testRegex(word, text),
    };
  }

  const needle = word.toLocaleLowerCase();
  return {
    word,
    matchMode,
    categoryKey,
    matches: (text) => text.toLocaleLowerCase().includes(needle),
  };
};

const parseConfiguredRules = () => {
  const rawRules = process.env.SCRAPBOOK_AUTOMOD_RULES;
  if (rawRules) {
    try {
      const parsed = JSON.parse(rawRules);
      if (!Array.isArray(parsed)) throw new TypeError("expected an array");
      const rules = parsed.map(buildRule);
      const ignored = rules.filter((rule) => !rule).length;
      if (ignored) {
        console.warn(
          `Scrapbook AutoMod ignored ${ignored} invalid or non-flag rule(s).`,
        );
      }
      return rules.filter(Boolean);
    } catch (error) {
      console.error("Could not parse SCRAPBOOK_AUTOMOD_RULES:", error.message);
      return [];
    }
  }

  // Keep the existing harmless local-test configuration working. Each value
  // follows Firehose's base64-encoded BAD_WORDS convention and uses word mode.
  return (process.env.SCRAPBOOK_BAD_WORDS || "")
    .split(",")
    .map((encoded) => {
      try {
        return Buffer.from(encoded.trim(), "base64").toString("utf8").trim();
      } catch {
        return "";
      }
    })
    .map(buildWordRule)
    .filter(Boolean);
};

const configuredRules = parseConfiguredRules();

export const moderationRulesConfigured = configuredRules.length > 0;

export const findModerationMatches = async (text) => {
  if (typeof text !== "string" || !text) return [];
  const results = await Promise.all(
    configuredRules.map(async (rule) =>
      (await rule.matches(text))
        ? {
            word: rule.word,
            matchMode: rule.matchMode,
            categoryKey: rule.categoryKey,
          }
        : null,
    ),
  );
  return results.filter(Boolean);
};
