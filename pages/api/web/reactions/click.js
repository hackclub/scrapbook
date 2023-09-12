import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import metrics from "../../../../metrics";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)

  if (session?.user === undefined) {
    res.json({ error: true, message: 'User undefined.' })
  }

  try {
    const emoji = await prisma.emojiReactions.findFirst({
      where: {
        updateId: req.query.post,
        emojiTypeName: req.query.emojiName
      }
    })

    const updateEmoji = await prisma.emojiReactions.update({
      where: {
        id: emoji.id
      },
      data: {
        usersReacted: emoji.usersReacted.includes(session.user.id)
          ? {
            set: emoji.usersReacted.filter(x => x != session.user.id)
          }
          : {
            push: session.user.id
          }
      }
    })
    if (updateEmoji.usersReacted.length == 0) {
      const deleteEmoji = await prisma.emojiReactions.delete({
        where: {
          id: emoji.id
        }
      })
    }
    metrics.increment("success.reaction_click", 1);
    res.json(updateEmoji)

  } catch {
    metrics.increment("errors.reaction_click", 1);
  }
}
