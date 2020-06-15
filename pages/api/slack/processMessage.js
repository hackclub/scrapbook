import {
  getUserRecord,
  displayStreaks,
  accountsTable,
  updatesTable,
  getPublicFileUrl,
  getReplyMessage,
  postEphemeral
} from '../../../lib/api-utils'

// ex. react('add', 'C248d81234', '12384391.12231', 'beachball')
async function react(addOrRemove, channel, ts, reaction) {
  return fetch('https://slack.com/api/reactions.' + addOrRemove, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({ channel: channel, name: reaction, timestamp: ts })
  }).then(r => r.json())
}

// replies to a message in a thread
//
// ex. reply('C34234d934', '31482975923.12331', 'this is a threaded reply!')
async function reply(channel, parentTs, text) {
  return fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      channel: channel,
      thread_ts: parentTs,
      text: text,
      parse: 'mrkdwn'
    })
  }).then(r => r.json()).then(json => json.user)
}

async function userInfo(userId) {
  return fetch('https://slack.com/api/users.info?user=' + userId, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
    }
  }).then(r => r.json()).then(json => json.user)
}

export default async (req, res) => {
  const { event } = req.body

  if (!(event.channel === process.env.CHANNEL && (event.subtype === 'file_share' || event.subtype === 'message_changed' || event.subtype === 'message_deleted'))) {
    //console.log("Event channel", event.channel, "did not match", process.env.CHANNEL + ". Skipping event...")
    return await res.json({ ok: true })
  }

  if (event.type === 'member_joined_channel') {
    await postEphemeral(event.channel, `Welcome to the Summer Scrapbook, <@${event.user}>!
    To get started, post a photo or video of a project you're working on—it can be anything!
    Your update will be added to your personal scrapbook, which I'll share with you after your
    first post.`, event.user)
  }

  if (event.subtype === 'message_changed' && event.message.text !== 'This message was deleted.') {
    const newMessage = event.message.text
    const prevTs = event.previous_message.ts

    const updateRecord = (await updatesTable.read({
      maxRecords: 1,
      filterByFormula: `{Message Timestamp} = '${prevTs}'`
    }))[0]
    await updatesTable.update(updateRecord.id, {
      'Text': newMessage
    })
    await postEphemeral(event.channel, `Your update has been edited! You should see it update on the website in a few seconds.`, event.message.user)
  }

  if (event.subtype === 'message_deleted') {
    const prevTs = event.previous_message.ts
    const updateRecord = (await updatesTable.read({
      maxRecords: 1,
      filterByFormula: `{Message Timestamp} = '${prevTs}'`
    }))[0]
    await updatesTable.delete(updateRecord.id)
    await postEphemeral(event.channel, `Your update has been deleted. You should see it disappear from the website in a few seconds.`, event.previous_message.user)
  }

  console.log("Event channel", event.channel, "matched", process.env.CHANNEL + ". Continuing...")
  await react('add', event.channel, event.ts, 'beachball')

  const files = event.files
  let attachments = []
  let videos = []
  let videoPlaybackIds = []

  await Promise.all(
    files.map(async file => {
      const publicUrl = await getPublicFileUrl(file.url_private)
      attachments.push({ url: publicUrl.url })
      if (publicUrl.muxId) {
        videos.push(publicUrl.muxId)
        videoPlaybackIds.push(publicUrl.muxPlaybackId)
      }
    })
  )

  console.log("Attachments:", attachments)
  console.log("Videos:", videos)

  const userRecord = await getUserRecord(event.user)
  await updatesTable.create({
    'Slack Account': [userRecord.id],
    'Post Time': new Date().toUTCString(),
    'Message Timestamp': event.ts,
    Text: event.text,
    Attachments: attachments,
    'Mux Asset IDs': videos.toString(),
    'Mux Playback IDs': videoPlaybackIds.toString()
  })

  const record = await getUserRecord(event.user)
  const updatedStreakCount = record.fields['Streak Count'] + 1

  await accountsTable.update(record.id, {
    'Streak Count': updatedStreakCount
  })

  await displayStreaks(event.user, updatedStreakCount)

  // remove beachball react, add final summer-of-making react
  await Promise.all([
    react('remove', event.channel, event.ts, 'beachball'),
    react('add', event.channel, event.ts, 'summer-of-making')
  ])

  const user = await userInfo(event.user)
  console.log(user)

  const updatedRecord = await getUserRecord(event.user)
  const replyMessage = await getReplyMessage(event.user, updatedRecord.fields['Username'], updatedRecord.fields['Streak Count'])
  await reply(event.channel, event.ts, replyMessage)

  // write final response
  await res.json({ ok: true })
}
