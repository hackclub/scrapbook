import AirtablePlus from 'airtable-plus'
import cheerio from 'cheerio'

export const accountsTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'appRxhF9qVMLbxAXR',
  tableName: 'Slack Accounts'
})

export const updatesTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'appRxhF9qVMLbxAXR',
  tableName: 'Updates'
})

export const displayStreaks = async (userId, streakCount) => {
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

export const canDisplayStreaks = async (userId) => {
  let record = await getUserRecord(userId)
  return record.fields['Display Streak']
}

export const getUserRecord = async userId => {
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

export const makeFilePublic = async (fileId, fileName) => {
  const publicFile = await fetch('https://slack.com/api/files.sharedPublicURL', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SLACK_USER_TOKEN}`
    },
    body: JSON.stringify({ file: fileId })
  }).then(r => r.json())
  //console.log(publicFile)
  const acceptedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov']
  const containsAcceptedFileTypes = acceptedFileTypes.some(el => fileName.toLowerCase().includes(el))
  if (containsAcceptedFileTypes) {
    const html = await fetch(publicFile.file.permalink_public).then(r => r.text())
    const $ = cheerio.load(html)
    const imgUrl = $('img').attr('src') || $('source').attr('src')
    return imgUrl
  }
}
