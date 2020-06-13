import { accountsTable, displayStreaks, getUserRecord, canDisplayStreaks, sendCommandResponse } from '../../../../lib/api-utils'

export default async (req, res) => {
  await res.status(200).end()

  let record = await getUserRecord(req.body.user_id)
  let display = await canDisplayStreaks(req.body.user_id)
  accountsTable.update(record.id, {
    'Display Streak': !display
  })
  await sendCommandResponse(req.body.response_url, display ? `Your streak count is now invisible.` : `Your streak count is now visible!`)
  let streakCount = record.fields['Streak Count']
  displayStreaks(req.body.user_id, streakCount)
}