import { getReactionRecord } from "../lib/reactions.js";
import { getUserRecord } from "../lib/users.js";
import Bottleneck from "bottleneck";
import prisma from "../lib/prisma.js";
import clubEmojis from "../lib/clubEmojis.js";
import { getEmojiRecord } from "../lib/emojis.js";

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

export default async ({ event }) => {
  const { item, user, reaction } = event;
  const ts = item.ts;
  limiter.schedule(async () => {
    try {
      const update = (
        await prisma.updates.findMany({
          where: {
            messageTimestamp: parseFloat(ts),
          },
        })
      )[0];
      if (!update) return;
      const reactionRecord = await getReactionRecord(reaction, update.id);
      if (typeof reactionRecord == "undefined") return;
      const userRecord = await getUserRecord(user);
      let usersReacted = reactionRecord.usersReacted;
      const updatedUsersReacted = usersReacted.filter(
        (userReacted) => userReacted != userRecord.id
      );
      if (updatedUsersReacted.length === 0) {
        await prisma.emojiReactions.deleteMany({
          where: {
            id: reactionRecord.id,
          },
        });
        const emojiRecord = await getEmojiRecord(reaction.emojiTypeName);
        if (Object.keys(clubEmojis).includes(emojiRecord.name)) {
          /*
          console.log({
            updateId: update.id,
            club: {
              slug: clubEmojis[emojiRecord.name]
            }
          })
          */

          await prisma.clubUpdate.deleteMany({
            where: {
              updateId: update.id,
              club: {
                slug: clubEmojis[emojiRecord.name]
              }
            },
          });
        }
      } else {
        await prisma.emojiReactions.update({
          where: { id: reactionRecord.id },
          data: { usersReacted: updatedUsersReacted },
        });
      }
    } catch {
      return;
    }
   
  });
};
