import {
  accountsTable,
  displayStreaks,
  getUserRecord,
  canDisplayStreaks,
  sendCommandResponse
} from '../../../../lib/api-utils'

export default async (req, res) => {
  await res.status(200).end()

  const userId = req.body.user_id
  const record = await getUserRecord(userId)
  const display = await canDisplayStreaks(userId)
  accountsTable.update(record.id, { 'Display Streak': !display })
  await sendCommandResponse(
    req.body.response_url,
    display
      ? `Your streak count is now invisible.`
      : `Your streak count is now visible!`
  )
  const streakCount = record.fields['Streak Count']
  displayStreaks(userId, streakCount)
}
