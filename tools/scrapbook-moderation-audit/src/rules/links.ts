import type { Finding } from "../types.js";
import { extractUrls } from "../utils/urls.js";

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rebrand.ly",
  "shorturl.at"
]);

export function detectSuspiciousLinks(text: string): Finding[] {
  const links = extractUrls(text);
  const findings: Finding[] = [];
  const domains = links.map((link) => link.domain).filter((domain): domain is string => Boolean(domain));

  const shorteners = domains.filter((domain) => URL_SHORTENERS.has(domain));
  if (shorteners.length > 0) {
    findings.push({
      source: "link_rule",
      label: "url_shortener",
      severity: "medium",
      detail: `Matched domain: ${[...new Set(shorteners)].join(", ")}`,
      inputTypes: ["text"]
    });
  }

  const inviteLinks = links.filter(({ url, domain }) => {
    if (!domain) return false;
    return (
      domain === "t.me" ||
      domain === "telegram.me" ||
      domain === "wa.me" ||
      domain === "chat.whatsapp.com" ||
      /(?:telegram|whatsapp)/i.test(url)
    );
  });
  if (inviteLinks.length > 0) {
    findings.push({
      source: "link_rule",
      label: "messaging_invite_link",
      severity: "medium",
      detail: `Matched URL: ${inviteLinks[0].url}`,
      inputTypes: ["text"]
    });
  }

  if (links.length > 3) {
    findings.push({
      source: "link_rule",
      label: "high_link_density",
      severity: "medium",
      detail: `Post contains ${links.length} external links`,
      inputTypes: ["text"]
    });
  }

  const domainCounts = new Map<string, number>();
  for (const domain of domains) {
    domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
  }
  const repeated = [...domainCounts.entries()].filter(([, count]) => count > 2);
  if (repeated.length > 0) {
    findings.push({
      source: "link_rule",
      label: "repeated_domain",
      severity: "low",
      detail: repeated.map(([domain, count]) => `${domain} (${count})`).join(", "),
      inputTypes: ["text"]
    });
  }

  return findings;
}
