const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

export type LinkInfo = {
  url: string;
  domain: string | null;
};

function cleanUrl(value: string): string {
  return value.replace(/[),.;!?]+$/g, "");
}

export function extractUrls(text: string): LinkInfo[] {
  const urls = new Set<string>();
  const slackLinkPattern = /<((https?:\/\/[^>|]+)(?:\|[^>]+)?)>/gi;
  const plainUrlPattern = /https?:\/\/[^\s<>)]+/gi;
  let textWithoutSlackLinks = text;

  for (const match of text.matchAll(slackLinkPattern)) {
    urls.add(cleanUrl(match[2]));
    textWithoutSlackLinks = textWithoutSlackLinks.replace(match[0], " ");
  }

  for (const match of textWithoutSlackLinks.matchAll(plainUrlPattern)) {
    urls.add(cleanUrl(match[0]));
  }

  return [...urls].map((url) => ({ url, domain: domainForUrl(url) }));
}

export function domainForUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const extension = parsed.pathname.split(".").pop()?.toLowerCase();
    return Boolean(extension && IMAGE_EXTENSIONS.has(extension));
  } catch {
    return false;
  }
}

export function extractImageUrlsFromAttachments(attachments: string[], maxImages: number): string[] {
  return attachments
    .filter((attachment) => typeof attachment === "string" && /^https?:\/\//i.test(attachment))
    .filter(isImageUrl)
    .slice(0, maxImages);
}

export function nonImageAttachments(attachments: string[]): string[] {
  return attachments
    .filter((attachment) => typeof attachment === "string" && /^https?:\/\//i.test(attachment))
    .filter((attachment) => !isImageUrl(attachment));
}
