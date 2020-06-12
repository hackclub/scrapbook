import AirtablePlus from 'airtable-plus'

const accountsTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'appRxhF9qVMLbxAXR',
  tableName: 'Slack Accounts'
})
export default accountsTable

const updatesTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'appRxhF9qVMLbxAXR',
  tableName: 'Updates'
})
export default updatesTable

const displayStreaks = async (userId, streakCount) => {
  let record = await getUserRecord(userId)
  let canDisplay = await canDisplayStreaks(userId)
  if (canDisplay) {
    await app.client.users.profile.set({
      token: process.env.USER_TOKEN,
      user: userId,
      profile: streakCount <= 7 ? { "status_emoji": `:streak-${streakCount}:` } : { "status_emoji": `:streak-7+:` }
    })
  }
}
export default displayStreaks

const canDisplayStreaks = async (userId) => {
  let record = await getUserRecord(userId)
  return record[0].fields['Display Streak']
}
export default canDisplayStreaks

const getUserRecord = async userId => {
  let record
  record = await accountsTable.read({
    filterByFormula: `{ID} = '${userId}'`,
    maxRecords: 1
  })
  if (typeof record[0] === 'undefined') {
    let profile = await app.client.users.info({
      token: process.env.BOT_TOKEN,
      user: userId
    })
    let username = profile.user.name
    record = await accountsTable.create({
      'ID': userID,
      'Username': username,
      'Streak Count': 0
    })
  }
  return record
}
export default getUserRecord
