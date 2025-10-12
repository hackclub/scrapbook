import prisma from '../../lib/prisma'

export const getUserStreaks = async () => {
  try {
    const streaks = await prisma.accounts.findMany({
      where: {
        maxStreaks: {
          gt: 0
        }
      },
      select: {
        id: true,
        username: true,
        slackID: true,
        avatar: true,
        streakCount: true,
        maxStreaks: true
      }
    })
    // Ensure values are JSON-serializable (no undefined)
    return streaks.map(user => ({
      id: user.id ?? null,
      username: user.username ?? null,
      slackID: user.slackID ?? null,
      avatar: user.avatar ?? null,
      streakCount: user.streakCount ?? 0,
      maxStreaks: user.maxStreaks ?? 0
    }));
  }
  catch (err) {
    throw Error(err)
  }
}


export default async (req, res) => {
  try {
    const streaks = await getUserStreaks();
    res.json(streaks);
  } catch (err) {
    res.status(404).json([]);
  }
}
