import { postEphemeral, react } from "../lib/slack.js";
import { forgetUser } from "../lib/users.js";
import { t } from "../lib/transcript.js";

export default async ({ event }) => {
  const { user, channel, ts } = event;
  if (channel != process.env.CHANNEL) return;
  await Promise.all([react("add", channel, ts, "beachball"), forgetUser(user)]);
  await Promise.all([
    react("remove", channel, ts, "beachball"),
    react("add", channel, ts, "confusedparrot"),
    postEphemeral(channel, t("messages.forget"), user),
  ]);
  return { ok: true };
};
