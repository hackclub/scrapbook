import {
  getUserRecord,
  displayStreaks,
  accountsTable,
  updatesTable,
  getPublicFileUrl
} from '../../../lib/api-utils'

export default async (req, res) => {
  const { challenge, event } = req.body

  if (challenge) res.json({ challenge })
  await res.json({ ok: true })

  if (!((event.channel === process.env.CHANNEL || event.channel === 'G015C21HR7C' || event.channel === 'G015WNVR1PS') && event.subtype === 'file_share')) {
    console.log("Event channel", event.channel, "did not match", process.env.CHANNEL + ". Skipping event...")
    return
  }

  console.log("Event channel", event.channel, "matched", process.env.CHANNEL + ". Continuing...")

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
  displayStreaks(event.user, updatedStreakCount)
}
