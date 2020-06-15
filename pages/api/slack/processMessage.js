import {
  getUserRecord,
  displayStreaks,
  accountsTable,
  updatesTable,
  getPublicFileUrl,
  getReplyMessage,
  postEphemeral,
  deleteScrap
} from '../../../lib/api-utils'

// ex. react('add', 'C248d81234', '12384391.12231', 'beachball')
async function react(addOrRemove, channel, ts, reaction) {
  return fetch('https://slack.com/api/reactions.' + addOrRemove, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({ channel: channel, name: reaction, timestamp: ts })
  }).then(r => r.json()).catch(err => console.error(err))
}

// replies to a message in a thread
//
// ex. reply('C34234d934', '31482975923.12331', 'this is a threaded reply!')
async function reply(channel, parentTs, text) {
  return fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      channel: channel,
      thread_ts: parentTs,
      text: text,
      parse: 'mrkdwn'
    })
  }).then(r => r.json()).then(json => json.ts)
}

async function userInfo(userId) {
  return fetch('https://slack.com/api/users.info?user=' + userId, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`
    }
  })
    .then(r => r.json())
    .then(json => json.user)
}
async function handleDelete(event) {
  console.log('handling deletion')
  console.log(event)
  let ts = event.thread_ts || event.message.thread_ts
  if (ts) {
    await Promise.all([
      react('add', channel, ts, 'beachball'),
      deleteScrap(event.thread_ts)
    ])
    await Promise.all([
      await react('remove', channel, ts, 'beachball'),
      await react('add', channel, ts, 'boom')
    ])
  } else {
    console.log("SHIT")
  }
}
async function handleCreate(event) {
  const { files, channel, ts, user, text } = event
  const r = await react('add', channel, ts, 'beachball')
  console.log('the channel of the day is...', channel, event)
  console.log('showing r', r)

  console.log(
    'Event channel',
    event.channel,
    'matched',
    process.env.CHANNEL + '. Continuing...'
  )
  await react('add', event.channel, event.ts, 'beachball')

  const files = event.files || []
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

  console.log('Attachments:', attachments)
  console.log('Videos:', videos)

  const userRecord = await getUserRecord(user)
  await updatesTable.create({
    'Slack Account': [userRecord.id],
    'Post Time': new Date().toUTCString(),
    'Message Timestamp': ts,
    Text: text,
    Attachments: attachments,
    'Mux Asset IDs': videos.toString(),
    'Mux Playback IDs': videoPlaybackIds.toString()
  })

  const record = await getUserRecord(user)
  const updatedStreakCount = record.fields['Streak Count'] + 1

  await accountsTable.update(record.id, {
    'Streak Count': updatedStreakCount
  })

  await displayStreaks(user, updatedStreakCount)

  // remove beachball react, add final summer-of-making react
  await Promise.all([
    react('remove', channel, ts, 'beachball'),
    react('add', channel, ts, 'summer-of-making')
  ])

  // const user = await userInfo(user)
  // console.log(user)

  const updatedRecord = await getUserRecord(user)
  const replyMessage = await getReplyMessage(user, updatedRecord.fields['Username'], updatedRecord.fields['Streak Count'])
  await reply(channel, ts, replyMessage)
}

export default async (req, res) => {
  const { event } = req.body
  console.log("Handling", event.type, event.subtype)

  if (event.channel !== process.env.CHANNEL) {
    // console.log('Ignoring event in', event.channel, 'because I only listen in on', process.env.CHANNEL)
    return await res.json({ ok: true })
  }

  console.log('this might be a join')
  if (event.type === 'member_joined_channel' || event.type === 'group_joined' || event.type === 'channel_join') {
    // someone has joined the channel– let's greet them!
    console.log("Someone new joined the channel! I'm welcoming user", event.user)
    const result = await postEphemeral(event.channel, `Welcome to the Summer Scrapbook, <@${event.user}>!
    To get started, post a photo or video of a project you're working on—it can be anything!
    Your update will be added to your personal scrapbook, which I'll share with you after your
    first post.`, event.user)

    return await res.json({ ok: true })
  }

  if (event.type === 'message' && event.subtype == 'file_share') {
    // someone has posted an attachment (video/image/sound)– let's add it to their scraps!
    console.log('this is an event', event)
    await handleCreate(event)
    return await res.json({ ok: true })
  }

  if ((event.type === 'message' && event.subtype === 'message_deleted') ||
    (event.type === 'message' && event.subtype === 'message_changed' && event.message.subtype === 'tombstone')
  ) {
    // someone removed their original post– let's remove it from the listings!
    await handleDelete(event)
    return await res.json({ ok: true })
  }

  // stop here while debugging
  return await res.json({ ok: true })

  if (event.subtype === 'message_changed') {
    if (event.message.subtype === 'tombstone') {
      console.log('lskdfalkdjalsgkalsjdgklasjdg')
      const ts = event.message.thread_ts

      const updateRecord = (await updatesTable.read({
        maxRecords: 1,
        filterByFormula: `{Message Timestamp} = '${ts}'`
      }))[0]
      await updatesTable.delete(updateRecord.id)

      const replies = await fetch(`https://slack.com/api/conversations.replies?token=${process.env.SLACK_BOT_TOKEN}&channel=${event.channel}&ts=${ts}`)
      const scrappyReply = replies.messages.filter(reply => reply.user === 'U015D6A36AG')
      await fetch('https://slack.com/api/chat.delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
        },
        body: JSON.stringify({
          channel: event.channel,
          ts: scrappyReply.ts
        })
      })
      await postEphemeral(event.channel, `Your update has been deleted. You should see it disappear from the website in a few seconds.`, event.previous_message.user)

      return await res.json({ ok: true })
    }
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

  const updatedRecord = await getUserRecord(event.user)
  const replyMessage = await getReplyMessage(
    event.user,
    updatedRecord.fields['Username'],
    updatedRecord.fields['Streak Count']
  )
  await reply(event.channel, event.ts, replyMessage)

  // write final response
  await res.json({ ok: true })
}
