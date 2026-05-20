import type { AuditUpdate, AuditUser } from "../types.js";

export function resolveAuthor(update: AuditUpdate): AuditUser | null {
  return update.Accounts ?? update.SlackAccounts ?? null;
}

export function userCacheKey(user: AuditUser): string {
  return user.id || user.slackID || user.username || "unknown";
}

export function profileUrlForUser(user: AuditUser): string | null {
  return user.username ? `https://scrapbook.hackclub.com/${user.username}` : null;
}

export function postUrlForUser(user: AuditUser, updateId: string): string | null {
  return user.username ? `https://scrapbook.hackclub.com/${user.username}#${updateId}` : null;
}

export function avatarForUser(user: AuditUser): string | null {
  return user.avatar || user.image || null;
}
