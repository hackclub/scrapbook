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
  let canDisplay = await canDisplayStreaks(userId)
  if (canDisplay) {
    let profileSetOptions = {
      user: userId,
      profile: streakCount <= 7 ? { "status_emoji": `:streak-${streakCount}:` } : { "status_emoji": `:streak-7+:` }
    }
    await fetch('https://slack.com/api/users.profile.set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SLACK_USER_TOKEN}`
      },
      body: JSON.stringify(profileSetOptions)
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
  record = (await accountsTable.read({
    filterByFormula: `{ID} = '${userId}'`,
    maxRecords: 1
  }))[0]
  if (typeof record === 'undefined') {
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
