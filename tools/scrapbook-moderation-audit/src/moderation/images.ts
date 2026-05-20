import { domainForUrl } from "../utils/urls.js";

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export type PreparedImageInput = {
  originalUrl: string;
  moderationUrl: string;
  mediaType: string;
  bytes: number;
};

function mimeFromUrl(url: string): string | null {
  try {
    const extension = new URL(url).pathname.split(".").pop()?.toLowerCase();
    if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
    if (extension === "png") return "image/png";
    if (extension === "gif") return "image/gif";
    if (extension === "webp") return "image/webp";
    return null;
  } catch {
    return null;
  }
}

function normalizeImageMimeType(contentType: string | null, url: string): string {
  const mediaType = contentType?.split(";")[0]?.trim().toLowerCase();
  const inferred = mimeFromUrl(url);

  if (mediaType === "image/jpg") return "image/jpeg";
  if (mediaType && SUPPORTED_IMAGE_TYPES.has(mediaType)) return mediaType;
  if ((!mediaType || mediaType === "application/octet-stream" || mediaType === "binary/octet-stream") && inferred) {
    return inferred;
  }

  throw new Error(`Unsupported image content type "${contentType ?? "missing"}" for ${url}`);
}

async function readResponseBytes(response: Response, maxBytes: number): Promise<Buffer> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error(`Image exceeds ${maxBytes} byte limit from content-length: ${contentLength}`);
  }

  if (!response.body) {
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > maxBytes) {
      throw new Error(`Image exceeds ${maxBytes} byte limit after download: ${arrayBuffer.byteLength}`);
    }
    return Buffer.from(arrayBuffer);
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error(`Image exceeds ${maxBytes} byte limit while downloading`);
    }
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks, totalBytes);
}

export function imageBytesToDataUrl(bytes: Buffer, mediaType: string): string {
  if (!SUPPORTED_IMAGE_TYPES.has(mediaType)) {
    throw new Error(`Unsupported image media type "${mediaType}"`);
  }
  return `data:${mediaType};base64,${bytes.toString("base64")}`;
}

export async function prepareImageForModeration(url: string, maxBytes: number): Promise<PreparedImageInput> {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
    headers: {
      accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,image/*;q=0.8,*/*;q=0.5",
      "user-agent": "scrapbook-moderation-audit/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch image: HTTP ${response.status} from ${domainForUrl(url) ?? url}`);
  }

  const mediaType = normalizeImageMimeType(response.headers.get("content-type"), url);
  const bytes = await readResponseBytes(response, maxBytes);

  if (bytes.length === 0) {
    throw new Error(`Downloaded image is empty: ${url}`);
  }

  return {
    originalUrl: url,
    moderationUrl: imageBytesToDataUrl(bytes, mediaType),
    mediaType,
    bytes: bytes.length
  };
}
