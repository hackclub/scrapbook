import {
  getUserRecord,
  displayStreaks,
  accountsTable,
  updatesTable,
  getPublicFileUrl
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

export default async (req, res) => {
  const { challenge, event } = req.body

  if (challenge) {
    return await res.json({ challenge })
  } else {
    res.json({ ok: true })
  }

  if (!((event.channel === process.env.CHANNEL || event.channel === 'G015C21HR7C' || event.channel === 'G015WNVR1PS') && event.subtype === 'file_share')) {
    console.log("Event channel", event.channel, "did not match", process.env.CHANNEL + ". Skipping event...")
    return
  }

  console.log("Event channel", event.channel, "matched", process.env.CHANNEL + ". Continuing...")

  let resp = await react('add', event.channel, event.ts, 'beachball')
  if (!resp.ok) {
    console.log("Error adding reaction to shared update, not continuing:", resp)
    return
  }

  const files = event.files

  let attachments = []
  let videos = []

  await Promise.all(
    files.map(async file => {
      const publicUrl = await getPublicFileUrl(file.url_private)
      attachments.push({ url: publicUrl.url })
      if (publicUrl.muxId) {
        videos.push(publicUrl.muxId)
      }
    })
  )

  console.log("Attachments:", attachments)
  console.log("Videos:", videos)

  const userRecord = await getUserRecord(event.user)
  await updatesTable.create({
    'Slack Account': [userRecord.id],
    'Post Time': new Date().toUTCString(),
    Text: event.text,
    Attachments: attachments,
    'Mux Asset IDs': videos.toString()
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
}
