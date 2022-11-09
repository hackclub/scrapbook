import { getNow } from 'src/services/updates/updates'
import { db } from 'src/lib/db'

export default async (req, res) => {
  res.status(200).end()
  const users = await db.account.findMany({
    where: {
      streakCount: {
        gt: 0,
      },
    },
  })
  users.forEach(async (user) => {
    const userId = user.id
    const timezone = user.timezone
    const username = user.username
    let now = new Date(getNow(timezone))
    now.setHours(now.getHours() - 4)

    const latestUpdate = await db.update.findFirst({
      where: {
        accountID: userId,
      },
      orderBy: [
        {
          postTime: 'desc',
        },
      ],
    })
    const createdTime = latestUpdate?.postTime
    if (!createdTime) {
      return
    }
    const createdDate = new Date(createdTime).getDate()

    if (shouldReset(now, createdDate) && user.streakCount != 0) {
      console.log(
        `It's been more than a day since ${username} last posted. Resetting their streak...`
      )
      await db.account.update({
        where: { id: user.id },
        data: { streakCount: 0 },
      })
    }
  })
}

const shouldReset = (now, createdDate) => {
  if (createdDate === 30 && (now.getDate() === 1 || now.getDate() === 2)) {
    return now.getDate() - createdDate > -29
  } else if (
    createdDate === 31 &&
    (now.getDate() === 1 || now.getDate() === 2)
  ) {
    return now.getDate() - createdDate > -30
  } else if (
    createdDate === 1 &&
    (now.getDate() === 30 || now.getDate() === 31)
  ) {
    return false
  } else {
    return now.getDate() - createdDate > 1
  }
}
