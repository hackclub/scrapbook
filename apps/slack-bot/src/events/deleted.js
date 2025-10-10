import { displayStreaks } from "../lib/streaks.js";
import { postEphemeral, react } from "../lib/slack.js";
import { getUserRecord } from "../lib/users.js";
import { deleteUpdate, updateExistsTS } from "../lib/updates.js";
import { shouldUpdateStreak } from "../lib/streaks.js";
import { app } from "../app.js";
import prisma from "../lib/prisma.js";
import metrics from "../metrics.js";

const deleteThreadedMessages = async (ts, channel, user) => {
  try {
    let result = await app.client.conversations.replies({ channel, ts });
    await Promise.all(
      result.messages.map(async (msg) => {
        if (msg.ts != msg.thread_ts) {
          let deleteM = await app.client.chat.delete({
            token: process.env.SLACK_USER_TOKEN,
            channel,
            ts: msg.ts,
          });
          return deleteM;
        } else {
          return null;
        } // top-level comment
      })
    );
    const userRecord = await getUserRecord(user);
    const shouldUpdate = await shouldUpdateStreak(user, false);
    if (shouldUpdate) {
      const updatedStreakCount = userRecord.streakCount - 1;
      if (updatedStreakCount >= 0) {
        await prisma.accounts.update({
          where: { slackID: userRecord.slackID },
          data: { streakCount: updatedStreakCount },
        });
        displayStreaks(user, updatedStreakCount);
      }
    }
    await postEphemeral(
      channel,
      `Your scrapbook update has been deleted :boom:`,
      user
    );
  } catch (e) {
    // console.log(e);
  }
};

export default async ({ event }) => {
  try {
    const { channel, message, previous_message, deleted_ts } = event;
    const ts = deleted_ts || previous_message?.thread_ts;
    const hasScrap = await updateExistsTS(ts);
    if (ts && hasScrap) {
      await Promise.all([
        await react("remove", channel, ts, "beachball"),
        await react("add", channel, ts, "boom"),
      ]);
      await Promise.all([
        react("add", channel, ts, "beachball"),
        deleteUpdate(ts),
        deleteThreadedMessages(ts, channel, previous_message.user),
      ]);
    }
    // metrics.increment("success.delete_msg", 1);
  } catch (e) {
    metrics.increment("errors.delete_msg", 1);
    // console.log(e);
  }
};
