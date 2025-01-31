import prisma from "../lib/prisma.js";
import { t } from "../lib/transcript.js";
import { getUserRecord } from "../lib/users.js";
import { displayStreaks } from "../lib/streaks.js";

export default async ({ command, respond }) => {
  // /scrappy-togglestreaks: toggle status
  // /scrappy-togglestreaks all: opt out of streaks completely
  const { user_id, text } = command;
  const args = text?.split(" ");
  const allArg = args[args[0] === "togglestreaks" ? 1 : 0];
  const toggleAllStreaks = allArg && allArg === "all";
  const record = await getUserRecord(user_id);
  const display = record.displayStreak;
  const streaksToggledOff = record.streaksToggledOff;
  if (toggleAllStreaks) {
    await Promise.all([
      prisma.accounts.update({
        where: { slackID: record.slackID },
        data: {
          displayStreak: streaksToggledOff ? true : false,
          streaksToggledOff: !streaksToggledOff,
        },
      }),
      respond(
        streaksToggledOff
          ? t("messages.streak.toggle.all.optin")
          : t("messages.streak.toggle.all.optout")
      ),
    ]);
  } else {
    await Promise.all([
      prisma.accounts.update({
        where: { slackID: record.slackID },
        data: {
          displayStreak: !display,
        },
      }),
      respond(
        display
          ? t("messages.streak.toggle.status.invisible")
          : t("messages.streak.toggle.status.visible")
      ),
    ]);
  }
  await displayStreaks(user_id, record.streakCount);
};
