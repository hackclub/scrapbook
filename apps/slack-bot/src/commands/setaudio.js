import { t } from "../lib/transcript.js";
import { getUserRecord } from "../lib/users.js";
import prisma from "../lib/prisma.js";

export default async ({ command, respond }) => {
  const { text, user_id } = command;
  let url = text.split(" ")[0];
  url = url?.substring(1, url.length - 1);
  let userRecord = await getUserRecord(user_id);
  if (!url) {
    if (userRecord.customAudioURL != null) {
      await respond(
        t("messages.audio.removed", { previous: userRecord.customAudioURL })
      );
      await prisma.accounts.update({
        // update the account with the new audioless
        where: { slackID: userRecord.slackID },
        data: { customAudioURL: null },
      });
    } else {
      await respond(t("messages.audio.noargs"));
    }
  } else {
    if (!url.includes("http")) {
      url = "https://" + url;
    }
    await prisma.accounts.update({
      // update the account with the new audio
      where: { slackID: userRecord.slackID },
      data: { customAudioURL: url },
    });
    await respond(
      t("messages.audio.set", {
        url: `https://scrapbook.hackclub.com/${userRecord.username}`,
      })
    );
  }
};
