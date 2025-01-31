import * as emoji from "node-emoji";
import { getUserRecord } from "./users.js";
import { app } from "../app.js";
import { v4 as uuidv4 } from "uuid";
import { Upload } from "@aws-sdk/lib-storage"
import S3 from "./s3.js";

const replaceEmoji = (str) => emoji.emojify(str.replace(/::(.*):/, ":"));

export const timeout = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const getNow = (tz) => {
  const date = new Date().toLocaleString("en-US", { timeZone: tz ?? undefined });
  return new Date(date).toISOString();
};

export const getDayFromISOString = (ISOString) => {
  const date = new Date(ISOString);
  try {
    date.setHours(date.getHours() - 4);
    ISOString = date.toISOString();
  } catch {}
  try {
    const month = ISOString.split("-")[1];
    const day = ISOString.split("-")[2].split("T")[0];
    return `${month}-${day}`;
  } catch {}
};

export const formatText = async (text) => {
  text = replaceEmoji(text).replace("&amp;", "&");
  let users = text.replaceAll("><@", "> <@").match(/<@U\S+>/g) || [];
  await Promise.all(
    users.map(async (u) => {
      const uID = u.substring(2, u.length - 1);
      const userRecord = await getUserRecord(uID);
      if (!userRecord) {
        app.client.users.profile
          .get({ user: u.substring(2, u.length - 1) })
          .then(({ profile }) => profile.display_name || profile.real_name)
          .then((displayName) => (text = text.replace(u, `@${displayName}`)));
      } else text = text.replace(u, ` @${userRecord.username} `);
    })
  );
  let channels = text.match(/<#[^|>]+\|\S+>/g) || [];
  channels.forEach(async (channel) => {
    const channelName = channel.split("|")[1].replace(">", "");
    text = text.replace(channel, `#${channelName}`);
  });
  return text;
};

export const getUrlFromString = (str) => {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  let url = str.match(urlRegex)[0];
  if (url.includes("|")) url = url.split("|")[0];
  if (url.startsWith("<")) url = url.substring(1, url.length - 1);
  return url;
};

// returns the urls that are in the text
export function getUrls(text) {
  /**
   * source: https://github.com/huckbit/extract-urls/blob/dc958a658ebf9d86f4546092d5a3183e9a99eb95/index.js#L5
   *
   * matches http,https,www and urls like raylib.com including scrapbook.hackclub.com
   */
  const matcher = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
  return text.match(matcher);
}

export function extractOgUrl(htmlDoc) {
  const result = RegExp("\"og:image\"").exec(htmlDoc);

  if (!result) return;

  let index = result.index;
  for(;;) {
    if (htmlDoc[index] === "/" && htmlDoc[index+1] === ">") break;
    if (htmlDoc[index] === ">") break;
    index++;
  }

  const ogExtract = htmlDoc.slice(result.index, index);
  const ogUrlString = ogExtract.split("content=")[1].trim();
  return ogUrlString.slice(1, -1);
}

export async function getPageContent(page) {
  const response = await fetch(page);
  const content = await response.text();
  return content;
}

async function uploadImageToS3(filename, blob) {
  let formData = new FormData();
  formData.append("file", blob, {
    filename,
    knownLength: blob.size
  });

  const uploads = new Upload({
    client: S3,
    params: {
      Bucket: "scrapbook-into-the-redwoods",
      Key: `${uuidv4()}-${filename}`,
      Body: blob
    }
  });

  const uploadedImage = await uploads.done();
  return uploadedImage.Location;
}

export async function getAndUploadOgImage(url) {
  const file = await fetch(url);
  let blob = await file.blob();
  const form = new FormData();
  form.append("file", blob, `${uuidv4()}.${blob.type.split("/")[1]}`);

  const imageUrl = await uploadImageToS3(`${uuidv4()}.${blob.type.split("/")[1]}`, blob);

  return imageUrl;
}
