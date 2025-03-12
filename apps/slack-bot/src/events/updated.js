// This function is called when a poster updates their previous post

import { formatText } from "../lib/utils.js";
import { postEphemeral } from "../lib/slack.js";
import { getUserRecord } from "../lib/users.js";
import prisma from "../lib/prisma.js";
import metrics from "../metrics.js";

export default async ({ event }) => {
  try {
    const updateRecord = await prisma.updates.findFirst({
      where: {
        messageTimestamp: parseFloat(event.previous_message.ts),
      },
    });
    if (updateRecord?.id) {
      const newMessage = await formatText(event.message.text);
      await prisma.updates.update({
        where: { id: updateRecord.id },
        data: { text: newMessage },
      });
      await postEphemeral(
        event.channel,
        `Your post has been edited! You should see it update on the website in a few seconds.`,
        event.message.user
      );
      await getUserRecord(event.message.user);
    }
    // metrics.increment("success.update_post", 1);
  } catch (e) {
    metrics.increment("errors.update_post", 1);
    console.log(e);
  }
};
