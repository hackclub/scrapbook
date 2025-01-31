import { app } from "../app.js";
import metrics from "../metrics.js"
import prisma from "../lib/prisma.js";
import { getEmojiRecord, emojiExists } from "./emojis.js";

// ex. react('add', 'C248d81234', '12384391.12231', 'beachball')
export const react = async (addOrRemove, channel, ts, reaction) => {
  try {
    await app.client.reactions[addOrRemove]({
      channel: channel,
      name: reaction,
      timestamp: ts,
    });

    const update = await prisma.updates.findFirst({
      where: {
        messageTimestamp: parseFloat(ts),
      },
    });

    const emojiRecord = await getEmojiRecord(reaction);
    if (update && emojiRecord) {
      if (addOrRemove === 'add') {
        const exists = await emojiExists(reaction, update.id);
        if (!exists) {
          await prisma.emojiReactions.create({
            data: {
              updateId: update.id,
              emojiTypeName: emojiRecord.name,
            },
          });
        }
      } else if (addOrRemove === 'remove') {
        await prisma.emojiReactions.deleteMany({
          where: {
            updateId: update.id,
            emojiTypeName: emojiRecord.name,
          },
        });
      }
    }
    metrics.increment(`success.react.${addOrRemove}`, 1);
  } catch (error) {
    metrics.increment(`errors.react.${addOrRemove}`, 1);
  }
};

// replies to a message in a thread
// ex. reply('C34234d934', '31482975923.12331', 'this is a threaded reply!')
export const reply = async (channel, parentTs, text, unfurl) => {
  try {
    await app.client.chat.postMessage({
      channel: channel,
      thread_ts: parentTs,
      text: text,
      parse: "mrkdwn",
      unfurl_links: unfurl,
      unfurl_media: false,
    });

    metrics.increment("success.reply", 1);
  } catch (err) {
    metrics.increment("errors.reply", 1);
  }
}

export const getMessage = async (ts, channel) => {
  try {
    const history = await app.client.conversations.history({
      channel,
      latest: ts,
      limit: 1,
      inclusive: true,
    });
    metrics.increment("success.get_message", 1);
    return history.messages[0] || null;
  } catch (e) {
    metrics.increment("errors.get_message", 1);
    return null;
  }
};

export const postEphemeral = async (channel, text, user, threadTs) => {
  try {
    await app.client.chat.postEphemeral({
      attachments: [],
      channel: channel,
      text: text,
      user: user,
      thread_ts: threadTs,
    });
    metrics.increment("success.post_ephemeral", 1);
  } catch (e) {
    metrics.increment("errors.post_ephemeral", 1);
    console.log(e);
  }
};
