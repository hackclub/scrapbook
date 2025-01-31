import { app } from "../app.js";
import { t } from "./transcript.js";
import { getUserRecord } from "./users.js";
import prisma from "./prisma.js";
import metrics from "../metrics.js";

export const setStatus = async (user, statusText, statusEmoji) => {
  try{
    // don't set status for @zrl or @msw as they're slack owners
    if(user == "U0C7B14Q3" || user == "U0266FRGP") return false

    // get user info
    const userInfo = await app.client.users.info({
      token: process.env.SLACK_USER_TOKEN,
      user,
    });

    const setProfile = app.client.users.profile.set({
      token: userInfo.user.is_admin ? process.env.SLACK_ADMIN_TOKEN : process.env.SLACK_USER_TOKEN,
      user,
      profile: {
        status_text: statusText,
        status_emoji: statusEmoji,
        status_expiration: 0,
      },
    });

  metrics.increment("success.set_status", 1);
  }
  catch(e){
    app.client.chat.postMessage({
      channel: "U0266FRGP",
      text: t("messages.errors.zach"),
    });
    app.client.chat.postMessage({
      channel: "USNPNJXNX",
      text: t("messages.errors.zach"),
    });
    metrics.increment("errors.set_status", 1);
  }
};

export const setAudio = async (user, url) => {
  const userRecord = await getUserRecord(user);
  await prisma.accounts.update({
    where: {
      slackID: userRecord.slackID,
    },
    data: {
      customAudioURL: url,
    },
  });
};
