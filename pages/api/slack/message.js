import { getUserRecord, displayStreaks, accountsTable } from '../../../lib/api-utils'

export default async (req, res) => {
  if (req.body.challenge) {
    res.json({ challenge: req.body.challenge })
  }
  await res.json({ ok: true })

  const postData = {
    channel: 'G015WNVR1PS',
    attachments: [],
    text: `Yay! Serverless bot works!`,
    user: 'U4QAK9SRW'
  }
  if (req.body.event.channel === 'G015WNVR1PS' && req.body.event.user !== 'U015D6A36AG') {
    console.log(req.body)
    /*await fetch('https://slack.com/api/chat.postEphemeral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify(postData)
    })*/
    let record = await getUserRecord(req.body.event.user)
    let updatedStreakCount = record[0].fields['Streak Count'] + 1
    await accountsTable.update(record[0].id, {
      'Streak Count': updatedStreakCount
    })
    displayStreaks(body.event.user, updatedStreakCount)
  }
}