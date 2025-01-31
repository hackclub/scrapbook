import prisma from "../lib/prisma.js";
import { t } from "../lib/transcript.js";
import { getUserRecord } from "../lib/users.js";

export default async ({ command, respond }) => {
  const args = command.text.split(" ");
  let url = args[0];
  url = url?.substring(0, url.length);
  if (!url) {
    const userRecord = await getUserRecord(command.user_id);
    if (userRecord.cssURL != null) {
      await prisma.accounts.update({
        where: { slackID: userRecord.slackID },
        data: { cssURL: null },
      });
      await respond(t("messages.css.removed"));
    } else {
      await respond(t("messages.css.noargs"));
    }
  } else {
    const user = await getUserRecord(command.user_id);
    if (url === "delete" || url === "remove") {
      await prisma.accounts.update({
        where: { slackID: user.slackID },
        data: { cssURL: "" },
      });
      await respond(t("messages.css.removed"));
    } else {
      await prisma.accounts.update({
        where: { slackID: user.slackID },
        data: { cssURL: url },
      });
      await respond(t("messages.css.set", { url }));
    }
  }
};
