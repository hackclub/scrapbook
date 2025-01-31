import prisma from "./prisma.js";
import { getUserRecord } from "./users.js";
import { getDayFromISOString, getNow } from "./utils.js";
import { getRandomWebringPost } from "./webring.js";
import { postEphemeral, react, reply } from "./slack.js";
import { t } from "./transcript.js";
import { SEASON_EMOJI } from "./seasons.js";
import channelKeywords from "./channelKeywords.js";
import { reactBasedOnKeywords } from "./reactions.js";
import { setStatus } from "./profiles.js";
import metrics from "../metrics.js";

export const shouldUpdateStreak = async (userId, increment) => {
  const userRecord = await getUserRecord(userId);
  const latestUpdates = await prisma.updates.findMany({
    orderBy: {
      postTime: "desc",
    },
    where: {
      accountsSlackID: userRecord.slackID,
    },
  });
  // increment = true | usually when they added a new update in slack
  // increment = false | usually when an update is deleted from slack
  /*
    We increment the user's streak if their last post was not made on the same day as today.

    The post we consider to be their last to increment their streak is the the most recent post they made before today. 
    The time difference between their last and today should tell us whether or not to increment their streak.
    
    We are going to decrement their streak if the post the post they made today had incremented their streak.
  */
  const createdTime = increment
    ? latestUpdates[1]?.postTime
    : latestUpdates[0]?.postTime;
  const today = getDayFromISOString(getNow(userRecord.timezone));
  const createdDay = getDayFromISOString(createdTime);
  return (
    today != createdDay || (increment ? !latestUpdates[1] : !latestUpdates[0])
  );
};

export const streaksToggledOff = async (user) => {
  const userRecord = await getUserRecord(user);
  return userRecord.streaksToggledOff;
};

export const incrementStreakCount = (userId, channel, message, ts) =>
  new Promise(async (resolve) => {
    const userRecord = await getUserRecord(userId);
    const shouldUpdate = await shouldUpdateStreak(userId, true);
    const randomWebringPost = await getRandomWebringPost(userId);
    let updatedMaxStreakCount;
    const updatedStreakCount = userRecord.streakCount + 1;
    const scrapbookLink =
      "https://scrapbook.hackclub.com/" + userRecord.username;
    await react("remove", channel, ts, "beachball"); // remove beachball react
    await react("add", channel, ts, SEASON_EMOJI);
    if (typeof channelKeywords[channel] !== "undefined")
      await react("add", channel, ts, channelKeywords[channel]);
    await reactBasedOnKeywords(channel, message, ts);
    if (shouldUpdate) {
      if (userRecord.newMember && updatedStreakCount > 1) {
        await prisma.accounts.update({
          where: {
            slackID: userRecord.slackID,
          },
          data: {
            newMember: false,
          },
        });
      }
      if (
        userRecord.maxStreaks < updatedStreakCount ||
        !userRecord.maxStreaks
      ) {
        updatedMaxStreakCount = updatedStreakCount;
      } else {
        updatedMaxStreakCount = userRecord.maxStreaks;
      }
      await prisma.accounts.update({
        where: {
          slackID: userRecord.slackID,
        },
        data: {
          maxStreaks: updatedMaxStreakCount,
          streakCount: updatedStreakCount,
        },
      });
      metrics.increment("streak", 1);
      await displayStreaks(userId, updatedStreakCount);
      if (userRecord.newMember && updatedStreakCount === 1) {
        postEphemeral(channel, t("messages.streak.newstreak"), userId);
      }
    }
    const replyMessage = await getReplyMessage(
      userId,
      userRecord.username,
      updatedStreakCount
    );

    await reply(
      channel,
      ts,
      shouldUpdate
        ? replyMessage
        : t("messages.streak.nostreak", { scrapbookLink })
    );
    if (randomWebringPost.post) {
      await reply(
        channel,
        ts,
        t("messages.webring.random", {
          randomWebringPost: randomWebringPost.post,
        }),
        true
      );
    } else if (!randomWebringPost.post && randomWebringPost.nonexistence) {
      await reply(
        channel,
        ts,
        t("messages.webring.nonexistence", {
          scrapbookUrl: randomWebringPost.scrapbookUrl,
        })
      );
    }
    resolve();
  });

export const getReplyMessage = async (user, username, day) => {
  const toggledOff = await streaksToggledOff(user);
  const scrapbookLink = `https://scrapbook.hackclub.com/${username}`;
  let streakNumber = day <= 7 ? day : "7+";
  if (toggledOff) streakNumber = "7+";
  if (day <= 3 && !toggledOff) {
    return t("messages.streak.oldmember." + streakNumber, {
      scrapbookLink,
      user,
    });
  }
  return t("messages.streak." + streakNumber, { scrapbookLink, user });
};

export const displayStreaks = async (userId, streakCount) => {
  const userRecord = await getUserRecord(userId);
  if (!userRecord.streaksToggledOff) {
    if (streakCount == 0 || !userRecord.displayStreak) {
      setStatus(userId, "", "");
    } else {
      const statusText = "day streak in #scrapbook";
      const statusEmoji = `:som-${streakCount > 7 ? "7+" : streakCount}:`;
      setStatus(userId, statusText, statusEmoji);
    }
  }
};
