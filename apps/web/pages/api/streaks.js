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
        username: true,
        slackID: true,
        avatar: true,
        streakCount: true,
        maxStreaks: true
      }
    })
    return streaks;
  }
  catch (err) {
    throw Error(err)
  }
}


export default async (req, res) => {
  try {
    const streaks = getUserStreaks();
    res.json(streaks);
  } catch {
    res.status(404).json(streaks);
  }
}
