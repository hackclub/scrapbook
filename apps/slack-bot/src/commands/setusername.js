import prisma from "../lib/prisma.js";
import { t } from "../lib/transcript.js";
import { getUserRecord } from "../lib/users.js";

export default async ({ command, respond }) => {
  const { text, user_id } = command;
  let username = text.split(" ")[0]?.replace(" ", "_");
  const userRecord = await getUserRecord(user_id);
  const exists = await prisma.accounts.findMany({ where: { username } });
  if (
    userRecord.lastUsernameUpdatedTime > new Date(Date.now() - 86400 * 1000)
  ) {
    await respond(t("messages.username.time"));
  } else if (!username) {
    await respond(t("messages.username.noargs"));
  } else if (username.length < 2) {
    await respond(t("messages.username.short"));
  } else if (exists.length > 0) {
    await respond(t("messages.username.exists"));
  } else {
    await prisma.accounts.update({
      // update the account with the new username
      where: { slackID: userRecord.slackID },
      data: {
        username: username,
        lastUsernameUpdatedTime: new Date(Date.now()),
      },
    });
    await respond(
      t("messages.username.set", {
        url: `https://scrapbook.hackclub.com/${username}`,
      })
    );
  }
};
