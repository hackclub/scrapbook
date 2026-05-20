import type { AuditConfig } from "../config.js";
import type { AuditPrismaClient } from "../prisma.js";
import type { AuditUpdate, Checkpoint } from "../types.js";

const accountSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  avatar: true,
  image: true,
  slackID: true,
  createdAt: true
};

function paginationWhere(checkpoint: Checkpoint | null) {
  if (!checkpoint?.lastPostTime || !checkpoint.lastUpdateId) return {};

  const lastPostTime = new Date(checkpoint.lastPostTime);
  return {
    OR: [
      { postTime: { gt: lastPostTime } },
      {
        postTime: lastPostTime,
        id: { gt: checkpoint.lastUpdateId }
      }
    ]
  };
}

function createdRangeWhere(config: AuditConfig) {
  return {
    ...(config.createdAfter ? { gte: config.createdAfter } : {}),
    ...(config.createdBefore ? { lt: config.createdBefore } : {})
  };
}

function userWhere(user: string | undefined) {
  if (!user) return {};

  return {
    OR: [
      { accountsID: user },
      { accountsSlackID: user },
      { Accounts: { is: { id: user } } },
      { Accounts: { is: { username: user } } },
      { Accounts: { is: { slackID: user } } },
      { SlackAccounts: { is: { id: user } } },
      { SlackAccounts: { is: { username: user } } },
      { SlackAccounts: { is: { slackID: user } } }
    ]
  };
}

function auditWhere(config: AuditConfig, checkpoint: Checkpoint | null) {
  const postTimeRange = createdRangeWhere(config);

  return {
    AND: [
      { postTime: { not: null, ...postTimeRange } },
      {
        OR: [{ Accounts: { isNot: null } }, { SlackAccounts: { isNot: null } }]
      },
      paginationWhere(checkpoint),
      userWhere(config.user)
    ]
  };
}

export async function countUpdatesForAudit(
  prisma: AuditPrismaClient,
  config: AuditConfig,
  checkpoint: Checkpoint | null
): Promise<number> {
  return prisma.updates.count({
    where: auditWhere(config, checkpoint)
  });
}

export async function findUpdatesBatch(
  prisma: AuditPrismaClient,
  config: AuditConfig,
  checkpoint: Checkpoint | null,
  take: number
): Promise<AuditUpdate[]> {
  return prisma.updates.findMany({
    where: auditWhere(config, checkpoint),
    orderBy: [{ postTime: "asc" }, { id: "asc" }],
    take,
    select: {
      id: true,
      postTime: true,
      text: true,
      attachments: true,
      muxPlaybackIDs: true,
      accountsID: true,
      accountsSlackID: true,
      messageTimestamp: true,
      channel: true,
      Accounts: { select: accountSelect },
      SlackAccounts: { select: accountSelect }
    }
  }) as Promise<AuditUpdate[]>;
}
