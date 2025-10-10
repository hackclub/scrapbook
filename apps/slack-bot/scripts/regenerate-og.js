import { Upload } from "@aws-sdk/lib-storage";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import S3 from "../src/lib/s3.js";

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
  for (; ;) {
    if (htmlDoc[index] === "/" && htmlDoc[index + 1] === ">") break;
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
  try {
    const file = await fetch(url);
    let blob = await file.blob();
    const form = new FormData();
    form.append("file", blob, `${uuidv4()}.${blob.type.split("/")[1]}`);

    const imageUrl = await uploadImageToS3(`${uuidv4()}.${blob.type.split("/")[1]}`, blob);

    return imageUrl;
  } catch (error) {
    throw error;
  }
}

async function processPosts() {
  const prismaClient = new PrismaClient();
  let processed = 0;

  const startDate = new Date("2023-12-22");
  const postsWithPotentiallyOGImages = await prismaClient.updates.findMany({
    where: {
      postTime: {
        gt: startDate
      }
    },
  });

  while (processed <= postsWithPotentiallyOGImages.length) {
    // console.log("Processing posts", processed, "to", processed + 100);
    await regenerateOGImages(postsWithPotentiallyOGImages.slice(processed, processed + 100));
    processed += 100;
  }
}

async function regenerateOGImages(posts) {
  return new Promise((resolve, reject) => {
    // this is the date when fallbacks to OG images was originally introduced
    const prismaClient = new PrismaClient();
    Promise.all(posts.map(async post => {
      // console.log("Working on post", post.id);
      // check if the post has an image that is hosted on `imgutil.s3.us-east-2.amazonaws.com` and it's actually an image
      const imageWasOnBucky = image => image.includes('imgutil.s3.us-east-2.amazonaws.com') && ["jpg", "jpeg", "png", "gif", "webp", "heic"].some(ext => image.toLowerCase().endsWith(ext))
      const attachmentsOnBucky = post.attachments.filter(attachment => imageWasOnBucky(attachment));
      const attachmentesNotOnBucky = post.attachments.filter(attachment => !imageWasOnBucky(attachment));

      if (post.attachments.length > 0 && attachmentsOnBucky.length === 0) return;

      const urls = getUrls(post.text);
      if (!urls || urls.length === 0) return;

      const regeneratedOGs = await Promise.all(urls.map(async url => {
        try {

          const pageContent = await getPageContent(url);
          const ogUrls = extractOgUrl(pageContent);

          if (ogUrls.length === 0) return null;

          let imageUrl = await getAndUploadOgImage(ogUrls);
          return imageUrl;
        } catch (error) {
          // console.log("Failed to update OG image", url, error);
          return null;
        }
      }));

      const updatedAttachments = [...attachmentesNotOnBucky, ...regeneratedOGs.filter(a => a !== null)];

      // update the attachments
      await prismaClient.updates.update({
        where: {
          id: post.id
        },
        data: {
          attachments: updatedAttachments
        }
      });

      // console.log("Updated post attachments", post.id);
    })).then(() => {
      resolve();
    });
    // console.log("Done!");
  });
}

processPosts();