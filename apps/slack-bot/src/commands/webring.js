import prisma from "../lib/prisma.js";
import { t } from "../lib/transcript.js";
import { getUserRecord } from "../lib/users.js";

export default async ({ command, respond }) => {
  const { user_id, text } = command;
  const args = text.split(" ");
  const webringUser = args[args[0] === "webring" ? 1 : 0]
    ?.split("@")[1]
    ?.split("|")[0];
  if (!webringUser) {
    return await respond(t("messages.webring.noargs"));
  }
  if (webringUser && !text.includes("<@")) {
    return await respond(t("messages.open.invaliduser"));
  }
  if (user_id === webringUser) {
    return await respond(t("messages.webring.yourself"));
  }
  const userRecord = await getUserRecord(user_id);
  const webringUserRecord = await getUserRecord(webringUser);
  const scrapbookLink = `https://scrapbook.hackclub.com/${userRecord.username}`;
  let currentWebring = userRecord.webring;
  if (!currentWebring) {
    currentWebring = [webringUserRecord.slackID];
  } else if (!currentWebring.includes(webringUserRecord.slackID)) {
    if (currentWebring.length >= 8)
      return await respond(t("messages.webring.toolong"));
    currentWebring.push(webringUserRecord.slackID);
    await respond(t(`messages.webring.add`, { webringUser, scrapbookLink }));
  } else {
    currentWebring = currentWebring.filter(
      (rec) => rec != webringUserRecord.slackID
    );
    await respond(t(`messages.webring.remove`, { webringUser, scrapbookLink }));
  }
  await prisma.accounts.update({
    where: { slackID: userRecord.slackID },
    data: { webring: currentWebring },
  });
};
