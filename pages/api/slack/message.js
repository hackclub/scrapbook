import { getUserRecord, displayStreaks, accountsTable, updatesTable, makeFilePublic } from '../../../lib/api-utils'

export default async (req, res) => {
  if (req.body.challenge) {
    res.json({ challenge: req.body.challenge })
  }
  await res.json({ ok: true })

  if (req.body.event.channel === 'G015C21HR7C' && req.body.event.subtype === 'file_share' && req.body.event.user !== 'U015D6A36AG') {
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
    /*const postData = {
      channel: 'G015WNVR1PS',
      attachments: [],
      text: `Yay! Serverless bot works!`,
      user: 'U4QAK9SRW'
    }
    await fetch('https://slack.com/api/chat.postEphemeral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify(postData)
    })*/
    let record = await getUserRecord(req.body.event.user)
    let updatedStreakCount = record.fields['Streak Count'] + 1
    await accountsTable.update(record.id, {
      'Streak Count': updatedStreakCount
    })
    displayStreaks(req.body.event.user, updatedStreakCount)
  }
}