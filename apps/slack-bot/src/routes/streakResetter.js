// This API route is pinged by a Zap every hour

import { getNow, timeout } from '../lib/utils.js'
import { setStatus } from '../lib/profiles.js'
import prisma from '../lib/prisma.js'
import fetch from 'node-fetch'
import { app } from "../app.js";
import metrics from '../metrics.js';

export default async (req, res) => {
  res.status(200).end()
  const users = await prisma.accounts.findMany({
    where: {
      streakCount: {
        gt: 0
      }
    }
  })
  users.forEach(async (user) => {
    await timeout(500)
    const userId = user.slackID
    const timezone = user.timezone
    const username = user.username
    let now = new Date(getNow(timezone))
    now.setHours(now.getHours() - 4)
    const latestUpdate = await prisma.updates.findFirst({
      where: {
        accountsSlackID: userId
      },
      orderBy: [
        {
          postTime: 'desc'
        }
      ]
    })
    const createdTime = latestUpdate?.postTime
    if (!createdTime) {
      // @msw: this fixes a bug where a user creates their first post then deletes it before streak resetter runs
      // this prevents trying to reset streaks based on a user without posts
      return
    }
    const createdDate = new Date(createdTime)
    const yesterday = new Date(getNow(timezone))
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(0)
    yesterday.setMinutes(0)
    if ((createdDate <= yesterday) && user.streakCount != 0) {
      /*
      console.log(
        `It's been more than a day since ${username} last posted. Resetting their streak...`
      )
      */

      try {
        await prisma.accounts.update({
          where: { slackID: user.slackID },
          data: { streakCount: 0 }
        });
        // metrics.increment("success.streak_reset", 1);
      } catch (err) {
        // console.log("Error: Failed to update user streak")
        metrics.increment("errors.streak_reset", 1);
      }

      if (user.displayStreak) {
        try {
          const info = await app.client.users.info({
            user: user.slackID 
          });
          if(!info.is_admin) await setStatus(userId, '', '')
        }
        catch(e) {
          app.client.chat.postMessage({
            channel: "USNPNJXNX",
            text: t("messages.errors.zach"),
          });
        }
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
          },
          body: JSON.stringify({
            channel: userId, //userId
            text: `<@${userId}> It's been more than 24 hours since you last posted a Scrapbook update, so I've reset your streak. No worries, though—post something else to start another streak! And the rest of your updates are still available at https://scrapbook.hackclub.com/${username} :)`
          })
        })
      }
    }
  })
  // Calculate streaks to fix any errors
  // @Josias - Not sure what errors this fixes so I'm commenting this out
  // let twoDaysAhead = new Date()
  // twoDaysAhead.setDate(twoDaysAhead.getDate() + 2)
  // let threeDaysBehind = new Date()
  // threeDaysBehind.setDate(threeDaysBehind.getDate() - 3)
  // const usersToCalculate = await prisma.accounts.findMany({
  //   include: {
  //     updates: {
  //       orderBy: {
  //         postTime: 'desc',
  //       },
  //     }
  //   },
  //   where: {
  //     updates: {
  //       some: {
  //         postTime: {
  //           lte: twoDaysAhead,
  //           gte: threeDaysBehind
  //         },
  //       }
  //     }
  //   },
  // })
  // usersToCalculate.forEach(async (user) => {
  //   await timeout(500)
  //   const userId = user.slackID
  //   const timezone = user.timezone
  //   const username = user.username
  //   const latestUpdate = user.updates[0]
  //   const createdTime = latestUpdate?.postTime
  //   if (!createdTime) {
  //     // @msw: this fixes a bug where a user creates their first post then deletes it before streak resetter runs
  //     // this prevents trying to reset streaks based on a user without posts
  //     return
  //   }
  //   let createdDate = new Date(createdTime)
  //   let streak = 0
  //   let k = 0
  //   const now = new Date(getNow(timezone));
  //   const yesterday = new Date(getNow(timezone))
  //   yesterday.setDate(now.getDate() - 1)
  //   yesterday.setHours(0)
  //   yesterday.setMinutes(0)
  //   while(createdDate >= yesterday) {
  //     streak++
  //     k++
  //     yesterday.setDate(yesterday.getDate() - 1)
  //     let newCreatedDate = new Date(user.updates[k]?.postTime)
  //     while(createdDate.toDateString() == newCreatedDate.toDateString()){
  //       k++
  //       newCreatedDate = new Date(user.updates[k]?.postTime)
  //     }
  //     createdDate = newCreatedDate
  //   }
  //   if(streak > 0 && streak > user.streakCount){
  //     await prisma.accounts.update({
  //       where: { slackID: user.slackID },
  //       data: { streakCount: streak }
  //     })
  //   }
  // })
}
