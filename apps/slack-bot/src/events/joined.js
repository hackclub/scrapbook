// This posts an introductory message to the #scrapbook channel when someone shows up

import { timeout } from "../lib/utils.js";
import { postEphemeral } from "../lib/slack.js";
import { t } from "../lib/transcript.js";

export default async ({ event }) => {
  const { user, channel } = event;
  if (event.channel != process.env.CHANNEL) return;
  await timeout(1000);
  postEphemeral(channel, t("messages.join.scrapbook", { user }), user);
};
