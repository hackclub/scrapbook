import { getUserRecord, displayStreaks, accountsTable, updatesTable, makeFilePublic, postEphemeral } from '../../../lib/api-utils'

export default async (req, res) => {
  if (req.body.challenge) {
    res.json({ challenge: req.body.challenge })
  }
  await res.json({ ok: true })

  if (req.body.event.channel === 'C0P5NE354' && req.body.event.subtype === 'file_share') {
    const files = req.body.event.files
    let attachments = []
    const promiseArray = files.map(async file => {
      attachments.push({
        'url': await makeFilePublic(file.id, file.name)
      })
    })
    await Promise.all(promiseArray)

    const userRecord = await getUserRecord(req.body.event.user)
    await updatesTable.create({
      'Slack Account': [userRecord.id],
      'Post Time': new Date().toUTCString(),
      'Text': req.body.event.text,
      'Attachments': attachments
    })
    let record = await getUserRecord(req.body.event.user)
    let updatedStreakCount = record.fields['Streak Count'] + 1
    await accountsTable.update(record.id, {
      'Streak Count': updatedStreakCount
    })
    displayStreaks(req.body.event.user, updatedStreakCount)
  }
}