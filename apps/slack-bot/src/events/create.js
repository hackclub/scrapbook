/*
This is triggered when a new post shows up in the #scrapbook channel

- posts without attachments should be rejected with an ephemeral message
- posts with attachments should be added to the scrapbook & replied to with a threaded message
*/

import { createUpdate } from "../lib/updates.js";
import deleted from "./deleted.js";
import metrics from "../metrics.js";

export default async ({ event }) => {
  // delete the scrapbook update if the message was deleted on slack client
  try {
    if (event.subtype === "message_deleted") return await deleted({ event });
  } catch (error) {
    metrics.increment("errors.message_deleted", 1);
  }

  if (event.thread_ts || event.channel != process.env.CHANNEL) return;
  const { files = [], channel, ts, user, text, thread_ts } = event;
  if (!thread_ts) await createUpdate(files, channel, ts, user, text);
};
