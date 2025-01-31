import S3 from "./s3.js";
import { Upload } from "@aws-sdk/lib-storage";
import Mux from "@mux/mux-node";
import { app } from "../app.js";
import { postEphemeral } from "./slack.js";
import { t } from "./transcript.js";
import { timeout } from "./utils.js";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import FormData from "form-data";
import convert from "heic-convert";
import stream from "node:stream";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET
});

const isFileType = (types, fileName) =>
  types.some((el) => fileName.toLowerCase().endsWith(el));

export const getPublicFileUrl = async (urlPrivate, channel, user) => {
  let fileName = urlPrivate.split("/").pop();
  const fileId = urlPrivate.split("-")[2].split("/")[0];
  const isImage = isFileType(["jpg", "jpeg", "png", "gif", "webp", "heic"], fileName);
  const isAudio = isFileType(["mp3", "wav", "aiff", "m4a"], fileName);
  const isVideo = isFileType(["mp4", "mov", "webm"], fileName);
  
  if (!(isImage || isAudio | isVideo)) return null;
  const file = await fetch(urlPrivate, {
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
    },
  });
  let blob = await file.blob();
  let mediaStream = blob.stream();
  if (blob.type === "image/heic") {
    const blobArrayBuffer = Buffer.from(await blob.arrayBuffer());
    // convert the image buffer into a jpeg image
    const outBuffer = await convert({
      buffer: blobArrayBuffer,
      format: "JPEG" 
    });

    // create a readable stream for upload
    mediaStream = stream.Readable.from(outBuffer);

    fileName = `./${uuidv4()}.jpeg`;
  } 
  if (blob.size === 19) {
    const publicFile = app.client.files.sharedPublicURL({
      token: process.env.SLACK_USER_TOKEN,
      file: fileId,
    });
    const pubSecret = publicFile.file.permalink_public.split("-").pop();
    const directUrl = `https://files.slack.com/files-pri/T0266FRGM-${fileId}/${fileName}?pub_secret=${pubSecret}`;
    if (isVideo) {
      postEphemeral(channel, t("messages.errors.bigvideo"), user);
      await timeout(30000);
      const asset = await mux.video.assets.create({
        input: directUrl,
        playback_policy: "public",
      });
      return {
        url: "https://i.imgur.com/UkXMexG.mp4",
        muxId: asset.id,
        muxPlaybackId: asset.playback_ids[0].id,
      };
    } else {
      await postEphemeral(channel, t("messages.errors.imagefail"));
      return { url: directUrl };
    }
  }
  if (isVideo) {
    let form = new FormData();
    form.append("file", mediaStream, {
      filename: fileName,
      knownLength: blob.size,
    });
    const uploadedUrl = await fetch("https://bucky.hackclub.com", {
      method: "POST",
      body: form,
    }).then((r) => r.text());
    const asset = await mux.video.assets.create({
      input: uploadedUrl,
      playback_policy: "public",
    });
    return {
      url: uploadedUrl,
      muxId: asset.id,
      muxPlaybackId: asset.playback_ids[0].id,
    };
  }

  const uploads = new Upload({
    client: S3,
    params: {
      Bucket: "scrapbook-into-the-redwoods",
      Key: `${uuidv4()}-${fileName}`,
      Body: mediaStream,
    }
  });
  const uploadedImage = await uploads.done();

  return {
    url: uploadedImage.Location,
    muxId: null,
    muxPlaybackId: null,
  };
};