import { getUserRecord } from "./users.js";
import { sample } from "./utils.js";
import prisma from "./prisma.js";

export const getRandomWebringPost = async (user) => {
  const userRecord = await getUserRecord(user);
  const webring = userRecord.webring;
  if (!webring || !webring.length) return { notfound: true };
  const randomUserRecord = sample(webring);
  const latestUpdate = await prisma.updates.findMany({
    orderBy: {
      postTime: "desc",
    },
    where: {
      accountsSlackID: randomUserRecord,
    },
  });
  if (latestUpdate.length === 0) {
    return {
      post: null,
      scrapbookUrl: `https://scrapbook.hackclub.com/${randomUserRecord.username}`,
      nonexistence: true,
    };
  } else {
    const messageTs =
      latestUpdate[0].messageTimestamp.toString().replace(".", "") + "00";
    const channel = latestUpdate[0].channel;
    return {
      post: `https://hackclub.slack.com/archives/${channel}/p${messageTs}`,
      scrapbookUrl: `https://scrapbook.hackclub.com/${randomUserRecord.username}`,
    };
  }
};
