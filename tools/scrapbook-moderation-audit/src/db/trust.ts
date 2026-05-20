import type { AuditPrismaClient } from "../prisma.js";
import type { AuditUser } from "../types.js";

export async function countKnownGoodPosts(prisma: AuditPrismaClient, user: AuditUser, now = new Date()): Promise<number> {
  const olderThan = new Date(now);
  olderThan.setDate(olderThan.getDate() - 7);

  return prisma.updates.count({
    where: {
      postTime: { not: null, lt: olderThan },
      OR: [
        { accountsID: user.id },
        ...(user.slackID ? [{ accountsSlackID: user.slackID }] : []),
        { Accounts: { is: { id: user.id } } },
        ...(user.slackID ? [{ SlackAccounts: { is: { slackID: user.slackID } } }] : [])
      ]
    }
  });
}
