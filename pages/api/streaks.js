import prisma from '../../lib/prisma'
import metrics from "../../metrics";

export const getUserStreaks = async () => {
  try {
    const streaks = await prisma.accounts.findMany({
      where: {
        maxStreaks: {
          gt: 0
        }
      },
      select: {
        username: true,
        slackID: true,
        avatar: true,
        streakCount: true,
        maxStreaks: true
      }
    })
    metrics.increment("success.get_user_streaks", 1);
    return streaks;
  }
  catch {
    metrics.increment("errors.get_user_streaks", 1);
    return [];
  }
}


export default async (req, res) => getUserStreaks().then(u => res.json(u || []))
