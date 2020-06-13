import {
  getUserRecord,
  displayStreaks,
  accountsTable,
  updatesTable,
  makeFilePublic,
  postEphemeral
} from '../../../lib/api-utils'

export default async (req, res) => {
  const { challenge, event } = req.body

  if (challenge) res.json({ challenge })
  await res.json({ ok: true })

  if (event.channel === 'C0P5NE354' && event.subtype === 'file_share') {
    const files = event.files
    const attachments = []
    await Promise.all(
      files.map(async file => {
        attachments.push({ url: await makeFilePublic(file.id, file.name) })
      })
    )

    const userRecord = await getUserRecord(event.user)
    await updatesTable.create({
      'Slack Account': [userRecord.id],
      'Post Time': new Date().toUTCString(),
      Text: event.text,
      Attachments: attachments
    })
    const record = await getUserRecord(event.user)
    const updatedStreakCount = record.fields['Streak Count'] + 1
    await accountsTable.update(record.id, {
      'Streak Count': updatedStreakCount
    })
    displayStreaks(event.user, updatedStreakCount)
  }
}
