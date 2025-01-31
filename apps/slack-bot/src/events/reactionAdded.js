import { createUpdate, updateExists, updateExistsTS } from "../lib/updates.js";
import { getEmojiRecord, emojiExists } from "../lib/emojis.js";
import { getReactionRecord, reactBasedOnKeywords } from "../lib/reactions.js";
import { react, getMessage, postEphemeral } from "../lib/slack.js";
import { t } from "../lib/transcript.js";
import { getUserRecord } from "../lib/users.js";
import shipEasterEgg from "../lib/shipEasterEgg.js";
import { SEASON_EMOJI } from "../lib/seasons.js";
import prisma from "../lib/prisma.js";
import Bottleneck from "bottleneck";
const limiter = new Bottleneck({ maxConcurrent: 1 });
import channelKeywords from "../lib/channelKeywords.js";
import clubEmojis from "../lib/clubEmojis.js";
import { commands } from "../commands/commands.js";
import metrics from "../metrics.js";

export default async ({ event }) => {
  const { item, user, reaction, item_user } = event;
  const { channel, ts } = item;
  if (channel == "C0M8PUPU6" && ts == "1679405777.423309" && reaction == "boom") {
    return await shipEasterEgg({ event });
  }
  if (reaction !== SEASON_EMOJI && user === "U015D6A36AG") return;
  if (
    (await updateExistsTS(ts)) &&
    (reaction === commands.scrappy || reaction === commands.scrappyParrotReaction) &&
    channel !== process.env.CHANNEL
  )
    return;
  const message = await getMessage(ts, channel);
  if ((await updateExistsTS(ts)) && reaction === commands.scrappyRetryReaction) {
    if (channelKeywords[channel])
      await react("add", channel, ts, channelKeywords[channel]);
    await reactBasedOnKeywords(channel, message.text, ts);
    await react("remove", channel, ts, "beachball");
    await react("add", channel, ts, SEASON_EMOJI);
    return;
  }
  // If someone reacted with a Scrappy emoji in a non-#scrapbook channel, then maybe upload it.
  if (
    (reaction === commands.scrappy || reaction === commands.scrappyParrotReaction) &&
    channel !== process.env.CHANNEL
  ) {
    if (item_user != user) {
      // If the reacter didn't post the original message, then show them a friendly message
      postEphemeral(
        channel,
        t("messages.errors.anywhere.op", { reaction }),
        user
      );
    } else if (message) {

      let hasNoMediaFiles = !message.files || message.files.length == 0;
      const files = hasNoMediaFiles ? [] : message.files;

      // log reaction used to create the update
      metrics.increment(`referrer.reaction.${reaction}`, 1);

      const update = await createUpdate(files, channel, ts, user, message.text);

      message.reactions.forEach(async reaction => {
        if (
          reaction.name === "scrappy" ||
          reaction.name === "scrappy-retry" ||
          reaction.name ===commands.scrappyParrotReaction 
        ) return;
        await prisma.emojiReactions.create({
          data: {
            updateId: update.id,
            emojiTypeName: reaction.name
          }
        });
      });
    }
    return;
  }
  if (
    reaction === commands.scrappyRetryReaction &&
    channel == process.env.CHANNEL &&
    message && !message.thread_ts
  ) {
    if (!message.files || message.files.length == 0) {
      postEphemeral(channel, t("messages.errors.anywhere.files"), user);
      return;
    }

    metrics.increment(`referrer.reaction.${reaction}`, 1);
    await createUpdate(message.files, channel, ts, item_user, message.text);
  }
  limiter.schedule(async () => {
    const emojiRecord = await getEmojiRecord(reaction);
    const update = await prisma.updates.findFirst({
      where: {
        messageTimestamp: parseFloat(ts),
      },
    });
    if (!update) return;
    const postExists = await updateExists(update.id);
    const reactionExists = await emojiExists(reaction, update.id);
    if (Object.keys(clubEmojis).includes(emojiRecord.name)) {
      await prisma.clubUpdate.create({
        data: {
          update: {
            connect: {
              id: update.id
            },
          },
          club: {
            connect: {
              slug: clubEmojis[emojiRecord.name]
            },
          }
        },
      });
    }
    if (!reactionExists) {
      // Post hasn't been reacted to yet at all, or it has been reacted to, but not with this emoji
      await prisma.emojiReactions.create({
        data: {
          updateId: update.id,
          emojiTypeName: emojiRecord.name,
        },
      });
    } else if (postExists && reactionExists) {
      const userRecord = await getUserRecord(user).catch((err) =>
        console.log("Cannot get user record", err)
      );
      // Post has been reacted to with this emoji
      const reactionRecord = await getReactionRecord(reaction, update.id).catch(
        (err) => console.log("Cannot get reaction record", err)
      );
      let usersReacted = reactionRecord.usersReacted;
      if (userRecord.id) {
        await usersReacted.push(userRecord.id);
      }
      await prisma.emojiReactions.update({
        where: { id: reactionRecord.id },
        data: { usersReacted: usersReacted },
      });
    }
  });
};