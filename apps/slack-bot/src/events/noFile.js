import { postEphemeral } from "../lib/slack.js";
import { t } from "../lib/transcript.js";
import { app } from "../app.js";

export default async ({ event }) => {
  const { channel, ts, user, text } = event;
  await Promise.all([
    app.client.chat.delete({
      token: process.env.SLACK_USER_TOKEN,
      channel,
      ts,
    }),
    postEphemeral(channel, t("messages.delete", { text }), user),
  ]);
};

export const noFileCheck = async ({ message, next }) => {
  if (
    !message.subtype &&
    !message.thread_ts &&
    message.channel == process.env.CHANNEL
  )
    await next();
};
