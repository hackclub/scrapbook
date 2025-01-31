import prisma from "./prisma.js";
import { app } from "../app.js";
import { sample } from "./utils.js";

export const getUserRecord = async (userId) => {
  let user
  try {
    user = await app.client.users.profile.get({ token: process.env.SLACK_USER_TOKEN, user: userId });
  }
  catch (e) {
    console.log(userId)
    console.error(e)
    return
  }
  if (user.profile === undefined) return;
  let record = await prisma.accounts.findUnique({
    where: {
      slackID: userId,
    },
  });
  if (record === null) {
    let profile = await app.client.users.info({ user: userId });
    let username =
      user.profile.display_name !== ""
        ? user.profile.display_name.replace(/\s/g, "")
        : user.profile.real_name.replace(/\s/g, "");
    let tzOffset = profile.user.tz_offset;
    let tz = profile.user.tz.replace(`\\`, "");
    let checkIfExists = await prisma.accounts.findFirst({
      where: { username: username },
    });
    record = await prisma.accounts.create({
      data: {
        slackID: userId,
        username: `${username}${checkIfExists != null ? `-${userId}` : ""}`,
        streakCount: 0,
        email: user.profile.email,
        website: user.profile.fields["Xf5LNGS86L"]?.value || null,
        github: user.profile.fields["Xf0DMHFDQA"]?.value || null,
        newMember: true,
        avatar: user.profile.image_192,
        timezoneOffset: tzOffset,
        timezone: tz,
      },
    });
    if (!user.profile.is_custom_image) {
      const animalImages = [
        "https://i.imgur.com/njP1JWx.jpg",
        "https://i.imgur.com/NdOZWDB.jpg",
        "https://i.imgur.com/l8dV3DJ.jpg",
        "https://i.imgur.com/Ej6Ovlq.jpg",
        "https://i.imgur.com/VG29lvI.jpg",
        "https://i.imgur.com/tDusvvD.jpg",
        "https://i.imgur.com/63H1hQM.jpg",
        "https://i.imgur.com/xGtLTa3.png",
      ];
      const animalImage = sample(animalImages);
      await prisma.accounts.update({
        where: { slackID: userId },
        data: { avatar: animalImage },
      });
    }
  } else {
    // update the user email if they don't have one on their account
      if (!record.email) {
        await prisma.accounts.update({
          where: {
            slackID: userId
          },
          data: {
            email: user.profile.email
          }
        })
      }
  }

  return { ...record, slack: user };
};

export const forgetUser = async (user) => {
  await Promise.all([
    await prisma.updates.deleteMany({
      // delete their updates...
      where: {
        slackID: user,
      },
    }),
    await prisma.accounts.deleteMany({
      // delete their account
      where: {
        accountsSlackID: user,
      },
    }),
  ]);
};

export const canDisplayStreaks = async (userId) => {
  let record = await getUserRecord(userId);
  return record.displayStreak;
};
