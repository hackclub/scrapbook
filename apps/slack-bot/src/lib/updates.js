import prisma from "./prisma.js";
import { react, reply, postEphemeral } from "./slack.js";
import { getPublicFileUrl } from "./files.js";
import { t } from "./transcript.js";
import { getUserRecord } from "./users.js";
import { formatText, extractOgUrl, getAndUploadOgImage, getUrls, getPageContent } from "./utils.js";
import { incrementStreakCount } from "./streaks.js";
import { app } from "../app.js";
import metrics from "../metrics.js";
import { config } from "dotenv";
import Airtable from "airtable";

// load environment variables
config()

// initialize the airtable base
const base = new Airtable({
  apiKey: process.env.PLUGINS_AIRTABLE_API_KEY,
}).base(process.env.PLUGINS_AIRTABLE_BASE_ID);



export const createUpdate = async (files = [], channel, ts, user, text) => {
  let attachments = [];
  let videos = [];
  let videoPlaybackIds = [];

  const channelInfo = await app.client.conversations.info({
    token: process.env.SLACK_BOT_TOKEN,
    channel
  });

  if (channelInfo.ok) {
    let channelName = channelInfo.channel.name_normalized;
    metrics.increment(`referrer.channel.${channelName}`, 1);
  } else {
    metrics.increment("errors.get_channel_name", 1);
    // console.error(channelInfo.error);
  }

  const upload = await Promise.all([
    react("add", channel, ts, "beachball"),
    ...files.map(async (file) => {
      const publicUrl = await getPublicFileUrl(file.url_private, channel, user);
      if (!publicUrl) {
        await postEphemeral(channel, t("messages.errors.filetype"), user, ts);
        return;
      }
      attachments.push(publicUrl.url);
      if (publicUrl.muxId) {
        videos.push(publicUrl.muxId);
        videoPlaybackIds.push(publicUrl.muxPlaybackId);
      }
    }),
  ])

  // if there are no attachments, attempt to get from the first link having an og image
  if (!text) return;
  const urls = getUrls(text);
  if (urls && urls.length > 0) {
    for (const url of urls) {
      try {
        const pageContent = await getPageContent(url);
        const ogUrls = extractOgUrl(pageContent);

        if (!ogUrls) continue;

        let imageUri = await getAndUploadOgImage(ogUrls);
        if (imageUri) {
          attachments.push(imageUri);
          break;
        }
      } catch (error) {
        // console.error(`Error processing URL ${url}:`, error);
        continue;
      }
    }
  }

  if ((attachments.length + videos.length) === 0) {
    await Promise.all([
      react("remove", channel, ts, "beachball"),
      react("add", channel, ts, "x"),
      // delete message if no media files
      app.client.chat.delete({
        token: process.env.SLACK_USER_TOKEN,
        channel,
        ts
      }),
      // notify user they need to include an image, video or link with preview
      postEphemeral(channel, t("messages.delete", { text }), user)
    ]);
    metrics.increment("errors.file_upload", 1);
    return "error";
  }

  let userRecord = await getUserRecord(user);

  const date = new Date().toLocaleString("en-US", {
    timeZone: userRecord.timezone,
  });

  const convertedDate = new Date(date).toISOString();
  const messageText = await formatText(text);

  const updateInfo = {
    messageText,
    postTime: ts,
    attachments,
    user: {
      slackID: userRecord.slackID,
      name: userRecord.slack.profile.display_name
    },
    channel
  };

  const update = await prisma.updates.create({
    data: {
      accountsID: userRecord.id,
      accountsSlackID: userRecord.slackID,
      postTime: convertedDate,
      messageTimestamp: parseFloat(ts),
      text: messageText,
      attachments: attachments,
      muxAssetIDs: videos,
      muxPlaybackIDs: videoPlaybackIds,
      isLargeVideo: attachments.some(
        (attachment) => attachment.url === "https://i.imgur.com/UkXMexG.mp4"
      ),
      channel: channel,
    },
  });

  metrics.increment("new_post", 1);
  await incrementStreakCount(user, channel, messageText, ts);

  // send a copy of the updates to the subcribers
  base("Update Listeners").select({
    maxRecords: 100,
    view: "Grid view",
    filterByFormula: "NOT({Status} = 'Inactive')",
  }).eachPage((records, nextPage) => {
    records.forEach(async record => {
      const subcriber = { app: record.get("App"), endpoint: record.get("Endpoint"), status: record.get("Status") };
      try {
        await fetch(subcriber.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updateInfo)
        });
        metrics.increment("success.send_post_update", 1);
      } catch { metrics.increment("errors.send_post_update", 1); } // silently fail to not crash app

    });

    // load the next set of documents
    nextPage();
  }, (error) => {
    if (error) metrics.increment("errors.airtable_get_post_listeners", 1);
      metrics.increment("success.airtable_get_post_listeners", 1);
  });

  return update;
};

export const updateExists = async (updateId) =>
  prisma.emojiReactions
    .findMany({
      where: {
        updateId: updateId,
      },
    })
    .then((r) => r.length > 0);

export const updateExistsTS = async (TS) => {
  try {
  const r = await prisma.updates
    .findMany({
      where: {
        messageTimestamp: parseFloat(TS),
      },
    })
    return r.length > 0;
  } catch {
    // THis is naughty i know
    return false;
  }
}


export const deleteUpdate = async (ts) => {
  return await prisma.updates.deleteMany({
    where: {
      messageTimestamp: parseFloat(ts),
    },
  });
};
